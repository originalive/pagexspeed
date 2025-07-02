export default async function validate(req, res) {
 if (req.method !== 'POST') {
   return res.status(405).json({ error: 'Method not allowed' });
 }
 
 const { UserName, MacAddress } = req.body;
 
 if (!UserName || !MacAddress) {
   return res.status(400).json({ error: 'UserName and MacAddress are required' });
 }
 
 return res.status(200).json({
   success: true,
   message: null,
   leftDays: 12,
   tokens: 0,
   appVersion: "2022.9.27.868",
   ipList: null,
   ShortMessage: null,
   News: null,
   KeyType: "monthly",
   paid: "Paid",
   DllVersion: null,
   ChromeDriver: null,
   SaltKey: null,
   ChromeVersion: null,
   UpdateURL: null
 });
}
