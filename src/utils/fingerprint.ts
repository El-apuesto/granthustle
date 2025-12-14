import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpInstance: any = null;

export async function getFingerprint(): Promise<string> {
  if (!fpInstance) {
    fpInstance = await FingerprintJS.load();
  }

  const result = await fpInstance.get();
  return result.visitorId;
}

export async function checkAbuseRisk(fingerprint: string, userId: string): Promise<boolean> {
  return false;
}
