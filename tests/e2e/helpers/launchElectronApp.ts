import type { ElectronApplication } from 'playwright';
import { _electron as electron } from 'playwright';

const DEFAULT_ARGS = ['.'];

type LaunchOptions = Parameters<typeof electron.launch>[0];

export async function launchElectronApp(
  overrides: Partial<LaunchOptions> = {}
): Promise<ElectronApplication> {
  const { args = DEFAULT_ARGS, cwd = process.cwd(), env, ...rest } = overrides;

  const baseEnv: Record<string, string | undefined> = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '',
    ELECTRON_ENABLE_LOGGING: 'true',
    ELECTRON_TEST_MODE: 'true',
  };

  const combinedEnv = {
    ...baseEnv,
    ...env,
  };

  const sanitizedEnv = Object.fromEntries(
    Object.entries(combinedEnv).filter(([, value]) => value !== undefined)
  ) as Record<string, string>;

  // Add flags for CI headless environment compatibility
  // --no-sandbox: Avoid Linux sandbox configuration issues
  // --disable-gpu: Disable GPU acceleration in xvfb (no hardware GPU)
  // --disable-dev-shm-usage: Prevent shared memory issues in containers
  // --disable-software-rasterizer: Prevent software rendering fallback issues
  // --disable-extensions: Reduce initialization complexity
  // --disable-background-networking: Faster startup, no network requests
  const electronArgs = process.env.CI
    ? [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--disable-background-networking',
        ...args,
      ]
    : args;

  return electron.launch({
    args: electronArgs,
    cwd,
    env: sanitizedEnv,
    ...rest,
  });
}
