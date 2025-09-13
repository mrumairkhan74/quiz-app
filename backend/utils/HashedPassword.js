const bcrypt = require('bcrypt');



const hashedPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

module.exports = hashedPassword;