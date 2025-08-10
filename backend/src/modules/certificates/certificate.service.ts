import { Certificate } from './certificate.model.js';
import { makeSerial } from '../../utils/id.js';

export async function issueCertificate(userId: string, highestLevel: string, sourceExamId: string) {
  const serial = makeSerial('CERT');
  const cert = await Certificate.create({ userId, highestLevel, sourceExamId, serial });
  return cert;
}

export async function myCertificates(userId: string) {
  return Certificate.find({ userId }).sort({ createdAt: -1 }).lean();
}
