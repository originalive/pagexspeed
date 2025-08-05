import { Buffer } from 'buffer';

const GLOBAL_APP_VERSION = "6.20.24";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const { key: licenseKey, mac } = req.body;

  if (!licenseKey || !mac) {
    return res.status(400).json({
      status: false,
      message: 'License Key and MAC are required.'
    });
  }

  try {
    // ✅ Accept any access-token
    const clientAccessToken = req.headers['access-token'] || 'unknown';

    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      return res.status(500).json({
        status: false,
        message: 'Server configuration error.'
      });
    }

    const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licence3.json', {
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(500).json({
        status: false,
        message: 'Failed to retrieve license data.'
      });
    }

    const data = await response.json();
    const licenses = JSON.parse(Buffer.from(data.content, 'base64').toString());
    const license = licenses.find(l => l.licenseKey === licenseKey);

    if (!license) {
      return res.status(400).json({
        status: false,
        message: 'Invalid license key.'
      });
    }

    const currentDate = new Date();
    const currentISOTime = currentDate.toISOString();
    let needsUpdate = false;

    if (!license.activationDate) {
      license.activationDate = currentISOTime;
      license.mac = mac;
      license.loginCount = 1;
      license.lastLogin = currentISOTime;
      needsUpdate = true;
    } else if (license.mac && license.mac !== mac) {
      return res.status(400).json({
        status: false,
        message: 'License already registered with another MAC address. Please reset it.'
      });
    } else {
      license.loginCount = (license.loginCount || 0) + 1;
      license.lastLogin = currentISOTime;
      needsUpdate = true;
    }

    const activationDate = new Date(license.activationDate);
    const daysPassed = Math.floor((currentDate - activationDate) / (1000 * 60 * 60 * 24));
    const leftDays = Math.max(0, license.validityDays - daysPassed);

    if (leftDays === 0) {
      return res.status(403).json({
        status: false,
        message: 'Key expired. Please renew.'
      });
    }

    if (needsUpdate) {
      await updateLicenseFile(licenses, data.sha, pat);
    }

    return res.status(200).json({
      status: true,
      message: "Your key is active and ready to go.",
      data: {
        leftDays,
        appVersion: GLOBAL_APP_VERSION,
        payment: license.paidStatus === true,
        shortMessage: license.shortMessage || "🔥🔥Doctor Doom Pahle Se Fast Update Kar Diya Gaya Hai @@@\n🧬 Panel Servar Issue Ke Karan Aaj Working Issue Tha Update Sevar Done\n💫💫 Best Payment Qr Irctc or Paytm QR@@@\nPhonepay QR   Booking Best @@@ @@@\n\nOnly Booking Time Use kare Faltu Test Mat kare @@@ @@@\nHamara Auto Update Funcation Hai Kush vi Update ayega to mil jayega",
        keyType: license.keyType || "MONTHLY"
      }
    });

  } catch (error) {
    console.error('Server error in authencate:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error.'
    });
  }
}

async function updateLicenseFile(licenses, sha, pat) {
  const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licence3.json', {
    method: 'PUT',
    headers: {
      'Authorization': `token ${pat}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      message: 'Update license data',
      content: Buffer.from(JSON.stringify(licenses, null, 2)).toString('base64'),
      sha: sha,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update license file');
  }
}