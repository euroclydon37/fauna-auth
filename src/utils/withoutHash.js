const log = value => {
  console.log(value)
  return value
}

exports.withoutHash = ({ hash, ...rest }) => log(rest)
