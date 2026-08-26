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

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");   
const { validateRegister } = require("../middleware/validationMiddleware");

// User Management (SuperAdmin / Admin)

// Create User
router.post(
    "/",
    protect,
    upload.single("profileImage"),
    authorize("SuperAdmin", "Admin"),
    createUser
);

// Get All Users
router.get(
    "/",
   
     protect,
     authorize("SuperAdmin", "Admin"),
    getUsers
);

// Get User By ID
router.get(
    "/:userId",
    protect,
    authorize("SuperAdmin", "Admin"),
    getUserById
);

// Update User
router.put(
    "/:userId",
    protect,
    authorize("SuperAdmin", "Admin"),
    updateUser
);

// Change User Status
router.patch(
    "/:userId/status",
    protect,
    authorize("SuperAdmin", "Admin"),
    changeUserStatus
);

// Change User Role
router.patch(
    "/:userId/role",
    protect,
    authorize("SuperAdmin"),
    changeUserRole
);

// Delete User (Soft Delete)
router.delete(
    "/:userId",
    protect,
    authorize("SuperAdmin"),
    deleteUser
);

// Update Own Profile
router.put(
    "/profile",
    protect,
    updateProfile
);

// Update Own Profile Image
router.put(
    "/profile/image",
    protect,
    upload.single("profileImage"),
    updateProfileImage
);



module.exports = router;