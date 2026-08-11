const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        try {
            let token;

            // Get token from cookies
            if (socket.handshake.headers.cookie) {
                const cookies = socket.handshake.headers.cookie
                    .split(";")
                    .map((cookie) => cookie.trim());

                const tokenCookie = cookies.find((cookie) =>
                    cookie.startsWith("token=")
                );

                if (tokenCookie) {
                    token = tokenCookie.split("=")[1];
                }
            }

            if (
                !token &&
                socket.handshake.auth &&
                socket.handshake.auth.token
            ) {
                token = socket.handshake.auth.token;
            }

            if (!token) {
                return next(
                    new Error("Authentication required.")
                );
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            const user = await User.findById(decoded.id)
                .select("-password");

            if (!user) {
                return next(
                    new Error("User not found.")
                );
            }

            if (user.status !== "Active") {
                return next(
                    new Error("User account is inactive.")
                );
            }

            socket.user = user;

            next();

        } catch (error) {
            return next(
                new Error("Invalid or expired token.")
            );
        }
    });

    io.on("connection", (socket) => {

        console.log(
            `Socket connected: ${socket.user.firstName} ${socket.user.lastName}`
        );


        const userRoom = `user:${socket.user._id}`;

        socket.join(userRoom);

        console.log(
            `User joined room: ${userRoom}`
        );


        socket.on("joinProject", (projectId) => {

            if (!projectId) {
                return;
            }

            const projectRoom = `project:${projectId}`;

            socket.join(projectRoom);

            console.log(
                `User ${socket.user._id} joined ${projectRoom}`
            );
        });

        socket.on("leaveProject", (projectId) => {

            if (!projectId) {
                return;
            }

            const projectRoom = `project:${projectId}`;

            socket.leave(projectRoom);

            console.log(
                `User ${socket.user._id} left ${projectRoom}`
            );
        });

        socket.on("disconnect", (reason) => {

            console.log(
                `Socket disconnected: ${socket.user._id}`,
                reason
            );

        });

    });

    return io;
};


const getIO = () => {

    if (!io) {
        throw new Error(
            "Socket.IO has not been initialized."
        );
    }

    return io;
};


module.exports = {
    initializeSocket,
    getIO,
};