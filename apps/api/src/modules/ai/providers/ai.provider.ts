export interface AIProvider {
  analyze(input: string): Promise<string>;
}
