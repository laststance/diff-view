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

  // Add --no-sandbox flag in CI to avoid Linux sandbox configuration issues
  const electronArgs = process.env.CI ? ['--no-sandbox', ...args] : args;

  return electron.launch({
    args: electronArgs,
    cwd,
    env: sanitizedEnv,
    ...rest,
  });
}
