const Client = require("../models/client");

exports.createClient = async (req, res) => {
    try {
        const {ClientName,
            company,
            email,
            phone,
            designation,
            address,
             status,
             } = 
        req.body;

        // Check required fields
        if (!ClientName || !company || !phone || !address) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        // Check email
        if (email) {
            const existingEmail = await Client.findOne({
                email: email.toLowerCase(),
            });

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                });
            }
        }

        // Check phone
        const existingPhone = await Client.findOne({
            phone,
        });

        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: "Phone number already exists",
            });
        }

        const client = await Client.create({
            ClientName,
            company,
            email: email ? email.toLowerCase() : undefined,
            phone,
            designation,
            address,
            status,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Client created successfully",
            client,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create client",
            error: error.message,
        });
    }
};

exports.getClient = async (req,res) => { 
 
    try {
        const client = await Client.find();
            return res.status(500).json({
            success: true,
            message: "clients found",
            clients: client
    
        });
         

    } catch (error) {
          return res.status(200).json({
            success: false,
            message: "no client available",
            error: error.message,
        });
    }

};

exports.getClientById = async (req,res) => {

    try {
        const client = await Client.findById(req.param.id);

        if (!client) {
            return res.status(400).json({
                success: false,
                message:"client doesn't exists"
            });
        }
          return res.status(200).json({
                success: false,
                message:"client exists"
            });



    } catch {
         return res.status(200).json({
            success: false,
            message: "no client available",
            error: error.message,

    });
}
} ;

exports.updateClient = async (req, res) => {
    try {
        const {
            ClientName,
            company,
            email,
            phone,
            designation,
            address,
            status,
        } = req.body;

        const client = await Client.findById(req.params.clientId);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found",
            });
        }

        // Check Email
        if (email) {
            const existingEmail = await Client.findOne({
                email: email.toLowerCase(),
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

        // Check Phone
        if (phone) {
            const existingPhone = await Client.findOne({
                phone,
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

        // Update remaining fields
        if (ClientName) client.ClientName = ClientName;
        if (company) client.company = company;
        if (designation) client.designation = designation;
        if (address) client.address = address;
        if (status) client.status = status;

        client.updatedBy = req.user._id;

        await client.save();

        return res.status(200).json({
            success: true,
            message: "Client updated successfully",
            client,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update client",
            error: error.message,
        });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const company = await Client.findByIdAndDelete(req.params.ClientId);

        if (!Client) {
            return res.status(404).json({
                success: false,
                message: "Client not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Client deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete client",
            error: error.message,
        });
    }
};