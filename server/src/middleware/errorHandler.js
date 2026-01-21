export function errorHandler(err, req, res, next) {
  console.error('Error:', err)

  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    })
  }

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({
      message: 'El recurso ya existe'
    })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor'
  })
}
