function validate(shema, target = 'body') {
  return (req, res, next) => {
    const data = req[target];

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No data provided' }); 

    }

    const {error, value} = shema.validate(data, {
      abortEarly: false,
      stripUnknown: true,

    })

    if (error) {
      return res.status(400).json({
        message: `Validation error 'on en ${target}`,
        errores: error.details.map(err => err.message)
    })
        }
req [target] = value;
    next();

        }       
}

export default validate;