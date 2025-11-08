import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig(async (): Promise<UserConfig> => {
  const react = await import('@vitejs/plugin-react');
  
  // E2Eテスト実行時はdevelopmentモードでビルドして詳細なエラーメッセージを取得
  const isTestMode = process.env.ELECTRON_TEST_MODE === 'true' || process.env.NODE_ENV === 'development';
  
  return {
    plugins: [react.default()],
    mode: isTestMode ? 'development' : 'production',
    build: {
      // E2Eテスト時はminifyを無効にして詳細なエラーメッセージを取得
      minify: isTestMode ? false : 'esbuild',
      // E2Eテスト時はsourcemapを有効にしてスタックトレースを詳細化
      sourcemap: isTestMode ? true : false,
    },
  };
});
