/**
 * Admin authorization middleware.
 * Must be used after the authenticate middleware so req.user is available.
 */
export function requireAdmin(req, res, next) {
  const role = req.user?.role;

  if (role !== 'admin' && role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: admin access required',
    });
  }

  next();
}
