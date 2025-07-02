export default async function generateToken(req, res) {
 if (req.method !== 'POST') {
   return res.status(405).json({ error: 'Method not allowed' });
 }
 
 const { licenseKey, deviceId } = req.body;
 
 if (!licenseKey || !deviceId) {
   return res.status(400).json({ error: 'licenseKey and deviceId are required' });
 }
 
 // Generate random token (UUID format)
 const authToken = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
   const r = Math.random() * 16 | 0;
   const v = c === 'x' ? r : (r & 0x3 | 0x8);
   return v.toString(16);
 });
 
 return res.status(200).json({
   success: true,
   authToken: authToken
 });
}
