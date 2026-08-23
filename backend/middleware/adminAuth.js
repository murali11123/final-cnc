/**
 * Very lightweight admin protection: no accounts, no login page, no sessions.
 * The admin (you) sends a secret key in the 'x-admin-key' header when adding,
 * editing, or deleting a design. Customers never see or need this - all
 * customer-facing routes (gallery, search) remain completely open.
 */
const requireAdminKey = (req, res, next) => {
  const providedKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error('ADMIN_API_KEY is not set in .env - admin routes are unusable until it is.');
    return res.status(500).json({ message: 'Server misconfiguration: ADMIN_API_KEY not set.' });
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ message: 'Not authorized. Missing or invalid admin key.' });
  }

  next();
};

module.exports = { requireAdminKey };