import { ReasoningPart } from '@ai-sdk/provider-utils';
import {
  CallWarning,
  FinishReason,
  LanguageModelRequestMetadata,
  LanguageModelResponseMetadata,
  ProviderMetadata,
} from '../types';
import { Source } from '../types/language-model';
import { LanguageModelUsage } from '../types/usage';
import { ContentPart } from './content-part';
import { GeneratedFile } from './generated-file';
import { ResponseMessage } from './response-message';
import { DynamicToolCall, StaticToolCall, TypedToolCall } from './tool-call';
import {
  DynamicToolResult,
  StaticToolResult,
  TypedToolResult,
} from './tool-result';
import { ToolSet } from './tool-set';

/**
 * The result of a single step in the generation process.
 */
export type StepResult<TOOLS extends ToolSet> = {
  /**
The content that was generated in the last step.
   */
  readonly content: Array<ContentPart<TOOLS>>;

  /**
The generated text.
*/
  readonly text: string;

  /**
The reasoning that was generated during the generation.
*/
  readonly reasoning: Array<ReasoningPart>;

  /**
The reasoning text that was generated during the generation.
*/
  readonly reasoningText: string | undefined;

  /**
The files that were generated during the generation.
*/
  readonly files: Array<GeneratedFile>;

  /**
The sources that were used to generate the text.
*/
  readonly sources: Array<Source>;

  /**
The tool calls that were made during the generation.
*/
  readonly toolCalls: Array<TypedToolCall<TOOLS>>;

  /**
The static tool calls that were made in the last step.
*/
  readonly staticToolCalls: Array<StaticToolCall<TOOLS>>;

  /**
The dynamic tool calls that were made in the last step.
*/
  readonly dynamicToolCalls: Array<DynamicToolCall>;

  /**
The results of the tool calls.
*/
  readonly toolResults: Array<TypedToolResult<TOOLS>>;

  /**
The static tool results that were made in the last step.
*/
  readonly staticToolResults: Array<StaticToolResult<TOOLS>>;

  /**
The dynamic tool results that were made in the last step.
*/
  readonly dynamicToolResults: Array<DynamicToolResult>;

  /**
The reason why the generation finished.
*/
  readonly finishReason: FinishReason;

  /**
The token usage of the generated text.
*/
  readonly usage: LanguageModelUsage;

  /**
Warnings from the model provider (e.g. unsupported settings).
*/
  readonly warnings: CallWarning[] | undefined;

  /**
Additional request information.
   */
  readonly request: LanguageModelRequestMetadata;

  /**
Additional response information.
*/
  readonly response: LanguageModelResponseMetadata & {
    /**
The response messages that were generated during the call.
Response messages can be either assistant messages or tool messages.
They contain a generated id.
*/
    readonly messages: Array<ResponseMessage>;

    /**
Response body (available only for providers that use HTTP requests).
     */
    body?: unknown;
  };

  /**
Additional provider-specific metadata. They are passed through
from the provider to the AI SDK and enable provider-specific
results that can be fully encapsulated in the provider.
   */
  readonly providerMetadata: ProviderMetadata | undefined;
};

export class DefaultStepResult<TOOLS extends ToolSet>
  implements StepResult<TOOLS>
{
  readonly content: StepResult<TOOLS>['content'];
  readonly finishReason: StepResult<TOOLS>['finishReason'];
  readonly usage: StepResult<TOOLS>['usage'];
  readonly warnings: StepResult<TOOLS>['warnings'];
  readonly request: StepResult<TOOLS>['request'];
  readonly response: StepResult<TOOLS>['response'];
  readonly providerMetadata: StepResult<TOOLS>['providerMetadata'];

  constructor({
    content,
    finishReason,
    usage,
    warnings,
    request,
    response,
    providerMetadata,
  }: {
    content: StepResult<TOOLS>['content'];
    finishReason: StepResult<TOOLS>['finishReason'];
    usage: StepResult<TOOLS>['usage'];
    warnings: StepResult<TOOLS>['warnings'];
    request: StepResult<TOOLS>['request'];
    response: StepResult<TOOLS>['response'];
    providerMetadata: StepResult<TOOLS>['providerMetadata'];
  }) {
    this.content = content;
    this.finishReason = finishReason;
    this.usage = usage;
    this.warnings = warnings;
    this.request = request;
    this.response = response;
    this.providerMetadata = providerMetadata;
  }

  get text() {
    return this.content
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join('');
  }

  get reasoning() {
    return this.content.filter(part => part.type === 'reasoning');
  }

  get reasoningText() {
    return this.reasoning.length === 0
      ? undefined
      : this.reasoning.map(part => part.text).join('');
  }

  get files() {
    return this.content
      .filter(part => part.type === 'file')
      .map(part => part.file);
  }

  get sources() {
    return this.content.filter(part => part.type === 'source');
  }

  get toolCalls() {
    return this.content.filter(part => part.type === 'tool-call');
  }

  get staticToolCalls() {
    return this.toolCalls.filter(
      (toolCall): toolCall is StaticToolCall<TOOLS> =>
        toolCall.dynamic === false,
    );
  }

  get dynamicToolCalls() {
    return this.toolCalls.filter(
      (toolCall): toolCall is DynamicToolCall => toolCall.dynamic === true,
    );
  }

  get toolResults() {
    return this.content.filter(part => part.type === 'tool-result');
  }

  get staticToolResults() {
    return this.toolResults.filter(
      (toolResult): toolResult is StaticToolResult<TOOLS> =>
        toolResult.dynamic === false,
    );
  }

  get dynamicToolResults() {
    return this.toolResults.filter(
      (toolResult): toolResult is DynamicToolResult =>
        toolResult.dynamic === true,
    );
  }
}
