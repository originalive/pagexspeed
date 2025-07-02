export default async function validate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Client expects UserName and MacAddress instead of key and clientId
  const { UserName, MacAddress } = req.body;
  
  if (!UserName || !MacAddress) {
    return res.status(400).json({
      success: false,
      message: "UserName and MacAddress are required",
      leftDays: 0,
      tokens: 0,
      appVersion: null,
      ipList: null,
      ShortMessage: null,
      News: null,
      KeyType: null,
      paid: "Unpaid",
      DllVersion: null,
      ChromeDriver: null,
      SaltKey: null,
      ChromeVersion: null,
      UpdateURL: null
    });
  }
  
  try {
    const pat = process.env.GITHUB_BLUEBERRY;
    if (!pat) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Fetch licenses from GitHub
    const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch license data' });
    }
    
    const data = await response.json();
    const licenses = JSON.parse(Buffer.from(data.content, 'base64').toString());
    
    // Find license by UserName instead of key
    const license = licenses.find(l => l.userName === UserName);
    
    if (!license) {
      return res.status(200).json({
        success: false,
        message: "Invalid username",
        leftDays: 0,
        tokens: 0,
        appVersion: null,
        ipList: null,
        ShortMessage: null,
        News: null,
        KeyType: null,
        paid: "Unpaid",
        DllVersion: null,
        ChromeDriver: null,
        SaltKey: null,
        ChromeVersion: null,
        UpdateURL: null
      });
    }
    
    const currentDate = new Date();
    const indianTime = currentDate.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let needsUpdate = false;
    
    // Initialize license on first use
    if (!license.activatedDate) {
      license.activatedDate = indianTime;
      license.macAddresses = [];
      license.loginCount = 0;
      needsUpdate = true;
    }
    
    // Calculate days left
    const activatedDate = new Date(license.activatedDate.split(', ')[0].split('/').reverse().join('-'));
    const daysPassed = Math.floor((currentDate - activatedDate) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, license.validityDays - daysPassed);
    
    // Check if expired
    if (daysLeft === 0) {
      return res.status(200).json({
        success: false,
        message: "Key expired. Purchase a new key or extend it.",
        leftDays: 0,
        tokens: 0,
        appVersion: null,
        ipList: null,
        ShortMessage: null,
        News: null,
        KeyType: license.keyType || "monthly",
        paid: "Expired",
        DllVersion: null,
        ChromeDriver: null,
        SaltKey: null,
        ChromeVersion: null,
        UpdateURL: null
      });
    }
    
    // Check MAC address instances
    const maxInstances = license.maxInstances || 1;
    if (!license.macAddresses.includes(MacAddress)) {
      if (license.macAddresses.length >= maxInstances) {
        return res.status(200).json({
          success: false,
          message: `Maximum instances (${maxInstances}) reached`,
          leftDays: daysLeft,
          tokens: 0,
          appVersion: null,
          ipList: null,
          ShortMessage: null,
          News: null,
          KeyType: license.keyType || "monthly",
          paid: "Paid",
          DllVersion: null,
          ChromeDriver: null,
          SaltKey: null,
          ChromeVersion: null,
          UpdateURL: null
        });
      }
      license.macAddresses.push(MacAddress);
      needsUpdate = true;
    }
    
    // Update login info
    license.loginCount += 1;
    license.lastLogin = indianTime;
    needsUpdate = true;
    
    // Save changes
    if (needsUpdate) {
      await updateLicenseFile(licenses, data.sha, pat);
    }
    
    // Return exact format as expected by client
    return res.status(200).json({
      success: true,
      message: null,
      leftDays: daysLeft,
      tokens: license.tokens || 0,
      appVersion: license.appVersion || "2022.9.27.868",
      ipList: license.ipList || null,
      ShortMessage: license.shortMessage || null,
      News: license.news || null,
      KeyType: license.keyType || "monthly",
      paid: "Paid",
      DllVersion: license.dllVersion || null,
      ChromeDriver: license.chromeDriver || null,
      SaltKey: license.saltKey || null,
      ChromeVersion: license.chromeVersion || null,
      UpdateURL: license.updateURL || null
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateLicenseFile(licenses, sha, pat) {
  const response = await fetch('https://api.github.com/repos/originalive/verify/contents/licenses.json', {
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
