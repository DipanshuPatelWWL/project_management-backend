const Client = require("../models/Client");
const regex = require("../utils/regexPatterns");

// Generate permanent sequential Client ID.
// Soft-deleted clients are included in the scan so IDs are never reused -
// same approach as generateCompanyId in companyController.js.
const generateClientId = async () => {
    const clients = await Client.find({
        clientId: { $exists: true, $ne: "" },
    }).select("clientId");

    let highestNumber = 0;

    clients.forEach((c) => {
        if (c.clientId) {
            const number = parseInt(c.clientId.replace("CLT", ""), 10);

            if (!isNaN(number) && number > highestNumber) {
                highestNumber = number;
            }
        }
    });

    const nextNumber = highestNumber + 1;

    return `CLT${String(nextNumber).padStart(3, "0")}`;
};

exports.createClient = async (req, res) => {
    try {
        const {
            ClientName,
            company,
            email,
            phone,
            designation,
            address,
            country,
            city,
            state,
            pincode,
            status,
        } = req.body;

        const missingFields = [];
        if (!ClientName || !String(ClientName).trim()) missingFields.push("Client Name");
        if (!company || !String(company).trim()) missingFields.push("Company");
        if (!phone || !String(phone).trim()) missingFields.push("Phone");
        if (!address || !String(address).trim()) missingFields.push("Address");
        if (!country || !String(country).trim()) missingFields.push("Country");
        if (!city || !String(city).trim()) missingFields.push("City");
        if (!state || !String(state).trim()) missingFields.push("State");
        if (!pincode || !String(pincode).trim()) missingFields.push("Pincode");

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    missingFields.length === 1
                        ? `${missingFields[0]} is required`
                        : `Please fill the required field(s): ${missingFields.join(", ")}`,
            });
        }

        if (!regex.phone.test(phone.trim())) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be a valid 10-digit number starting with 6, 7, 8, or 9",
            });
        }

        if (email && email.trim() && !regex.email.test(email.trim().toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        if (pincode) {
            const isIndia = !country || country.trim().toLowerCase() === "india";
            if (isIndia && !regex.pincode.test(pincode.trim())) {
                return res.status(400).json({
                    success: false,
                    message: "Pincode must be a valid 6-digit postal code for India",
                });
            } else if (!isIndia && !/^[a-zA-Z0-9\s-]{3,10}$/.test(pincode.trim())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid postal code format",
                });
            }
        }

        if (email) {
            const existingEmail = await Client.findOne({
                email: email.toLowerCase(),
                isDeleted: false,
            });

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                });
            }
        }

        const existingPhone = await Client.findOne({
            phone,
            isDeleted: false,
        });

        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: "Phone number already exists",
            });
        }

        // Generate permanent Client ID only after validation
        const clientId = await generateClientId();

        const client = await Client.create({
            clientId,
            ClientName,
            company,
            email: email ? email.toLowerCase() : undefined,
            phone,
            designation,
            address,
            country: country ? country.trim() : "India",
            city,
            state,
            pincode,
            status,
            isDeleted: false,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Client created successfully",
            client,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create client",
            error: error.message,
        });
    }
};

exports.getClient = async (req, res) => {
    try {
        // Only active (non-deleted) clients are displayed
        const clients = await Client.find({
            isDeleted: false,
        });

        // Preview of the next Client ID, without incrementing anything
        const nextClientId = await generateClientId();

        return res.status(200).json({
            success: true,
            message: "Clients found",
            clients,
            nextClientId,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch clients",
            error: error.message,
        });
    }
};

exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findOne({
            _id: req.params.clientId,
            isDeleted: false,
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client doesn't exist",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Client found",
            client,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch client",
            error: error.message,
        });
    }
};

exports.updateClient = async (req, res) => {
    try {
        const {
            ClientName,
            company,
            email,
            phone,
            designation,
            address,
            country,
            city,
            state,
            pincode,
            status,
        } = req.body;

        const client = await Client.findOne({
            _id: req.params.clientId,
            isDeleted: false,
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found",
            });
        }

        if (email) {
            if (!regex.email.test(email.trim().toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address",
                });
            }

            const existingEmail = await Client.findOne({
                email: email.toLowerCase(),
                isDeleted: false,
                _id: { $ne: req.params.clientId },
            });

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                });
            }

            client.email = email.toLowerCase();
        }

        if (phone) {
            if (!regex.phone.test(phone.trim())) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number must be a valid 10-digit number starting with 6, 7, 8, or 9",
                });
            }

            const existingPhone = await Client.findOne({
                phone,
                isDeleted: false,
                _id: { $ne: req.params.clientId },
            });

            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number already exists",
                });
            }

            client.phone = phone;
        }

        if (pincode) {
            const checkCountry = country || client.country || "India";
            const isIndia = checkCountry.trim().toLowerCase() === "india";
            if (isIndia && !regex.pincode.test(pincode.trim())) {
                return res.status(400).json({
                    success: false,
                    message: "Pincode must be a valid 6-digit postal code for India",
                });
            } else if (!isIndia && !/^[a-zA-Z0-9\s-]{3,10}$/.test(pincode.trim())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid postal code format",
                });
            }
            client.pincode = pincode;
        }

        if (ClientName) client.ClientName = ClientName;
        if (company) client.company = company;
        if (designation !== undefined) client.designation = designation;
        if (address) client.address = address;
        if (country) client.country = country;
        if (city) client.city = city;
        if (state) client.state = state;
        if (status) client.status = status;

        client.updatedBy = req.user._id;

        await client.save({ validateModifiedOnly: true });

        return res.status(200).json({
            success: true,
            message: "Client updated successfully",
            client,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update client",
            error: error.message,
        });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        // Soft delete instead of permanently deleting the document
        const client = await Client.findOne({
            _id: req.params.clientId,
            isDeleted: false,
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found",
            });
        }

        client.isDeleted = true;
        client.updatedBy = req.user._id;

        await client.save({ validateModifiedOnly: true });

        return res.status(200).json({
            success: true,
            message: "Client deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete client",
            error: error.message,
        });
    }
};