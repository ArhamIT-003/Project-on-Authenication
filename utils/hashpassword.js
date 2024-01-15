import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

export const decryptPassword = async (password, userpass) => {
  try {
    const decryptPass = await bcrypt.compare(password, userpass);
    return decryptPass;
  } catch (error) {
    console.error(error);
    throw new Error("Error comparing passwords");
  }
};
