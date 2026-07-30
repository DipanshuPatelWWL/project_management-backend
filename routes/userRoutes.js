const express = require("express");

const router = express.Router();

const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateProfile,
    updateProfileImage,
    changeUserStatus,
    changeUserRole,
} = require("../controllers/userController");

router.post("/create-user",  createUser);


router.get("/users",  getUsers);


router.get("/users/:userId",  getUserById);


router.put("/users/:userId",  updateUser);

router.put("/users/:userId/status" ,changeUserStatus);

router.put("/users/usersId,role",changeUserRole);

router.delete("/users/:userId",  deleteUser);

router.put("/profile" ,updateProfile);

module.exports = router;