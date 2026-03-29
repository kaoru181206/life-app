export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 静的アセット（JS/CSS/画像など）はそのまま返す
    const assetExtensions = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|json|txt)$/;
    if (assetExtensions.test(url.pathname)) {
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) {
        return response;
      }
    }

    // SPA: 全ルートを index.html で返す
    const indexUrl = new URL("/index.html", url.origin);
    return env.ASSETS.fetch(new Request(indexUrl.toString(), request));
  },
} satisfies ExportedHandler<Env>;