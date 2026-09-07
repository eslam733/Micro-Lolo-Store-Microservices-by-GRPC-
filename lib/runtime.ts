export function useInProcessServices(): boolean {
  return process.env.VERCEL === '1' || process.env.USE_INPROCESS === 'true';
}
