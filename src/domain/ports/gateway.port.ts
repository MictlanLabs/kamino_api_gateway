export interface GatewayPort {
  forwardRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: any,
  ): Promise<any>;
}