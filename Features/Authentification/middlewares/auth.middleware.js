exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin' ||'user') {
    next();
  } else {
    res.status(403).json({ message: 'Unauthorized' });
  }
};