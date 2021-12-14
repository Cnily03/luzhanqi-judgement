const crypto = require("crypto");
const stringRandom = require("string-random");
/**
 * enceypt HASH
 * @param {string} str - The string needed to be encrypted
 * @param {string} type - Optional HASH type: ` sha1 | sha256 | sha512 | md5 `
 * @param {string} [salt=""] - The salt of the cryption
 * @returns {string}
 */
const encryptHash = (str, type, salt = "") => {
    var hash = crypto.createHash(type);
    var code = hash.update(str + salt).digest("hex");
    return code;
}
/**
 * enceypt AES
 * @param {string} str - The string needed to be encrypted
 * @param {string} aesKey - The key of AES
 * @param {string} [aesIv=aesKey] - The iv of AES
 * @param {string} [algorithm="aes-128-cbc"] - AES algoritem
 * @returns {string}
 */
function encryptAes(str, aesKey, aesIv = aesKey, algorithm = "aes-128-cbc") {
    var key = Buffer.from(aesKey, "utf8");
    var iv = Buffer.from(aesIv, "utf8");
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    var code = cipher.update(str, "utf8", "hex");
    code += cipher.final("hex");
    return code;
}
/**
 * deceypt AES
 * @param {string} str - The string needed to be decrypted
 * @param {string} aesKey - The key of AES
 * @param {string} [aesIv=aesKey] - The iv of AES
 * @param {string} [algorithm="aes-128-cbc"] - AES algoritem
 * @returns {string}
 */
function decryptAes(str, aesKey, aesIv = aesKey, algorithm = "aes-128-cbc ") {
    var key = Buffer.from(aesKey, "utf8");
    var iv = Buffer.from(aesIv, "utf8");
    var cipher = crypto.createDecipheriv(algorithm, key, iv);
    var code = cipher.update(str, "hex", "utf8");
    code += cipher.final("utf8");
    return code;
}

module.exports = {
    hash: encryptHash,
    aes: {
        encrypt: encryptAes,
        decrypt: decryptAes
    },
    random: stringRandom
}