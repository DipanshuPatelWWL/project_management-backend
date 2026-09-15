const Company = require ("../models/company");

exports.createCompany = async (req,res) => {
    try {  
    const {
        companyName,companyCode,companyLogo,companyType,industry,officialEmail,contactNumber,website,addressLine1,city,state,country,pincode,timeZone,currency,workingDays,officeStartTime,officeEndTime, status,
    } = req.body; 
    
        
 const existingCompanyCode = await Company.findOne({
    companyCode : companyCode.toUpperCase(),
 }) ;

  if (existingCompanyCode) {
    return res.status(400).json({
        success : false , 
        message : "A company code already exists"
    });
  }

        // Check official email
        if (officialEmail) {
            const existingEmail = await Company.findOne({
                officialEmail: officialEmail.toLowerCase(),
            });

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Official email already exists",
                });
            }
        }

        const company = await Company.create({
            companyName,
            companyCode: companyCode.toUpperCase(),
            companyLogo,
            companyType,
            industry,
            officialEmail: officialEmail.toLowerCase(),
                
            contactNumber,
            website,
            addressLine1,
            city,
            state,
            country,
            pincode,
            timeZone,
            currency,
            workingDays,
            officeStartTime,
            officeEndTime,
            status,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Company created successfully",
            company,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create company",
            error: error.message,
        });
    }
};

exports.getCompany = async (req, res) => {
    try {
        const companies = await Company.find();

        return res.status(200).json({
            success: true,
            count: companies.length,
            message: "Companies fetched successfully",
            companies,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch company data",
            error: error.message,
        });
    }
};


exports.getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.companyId);

        if (!company) {
            return res.status(400).json({
                success: false,
                message: "Company not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Company found",
            company,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const { companyName,companyCode,companyLogo,companyType,industry,officialEmail,contactNumber,website,addressLine1,city, state, country, pincode, timeZone,currency, workingDays,officeStartTime,officeEndTime,status,
        } = req.body;

        const company = await Company.findById(req.params.companyId);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        // Check Company Code
        if (companyCode) {
            const existingCompanyCode = await Company.findOne({
                companyCode: companyCode.toUpperCase(),
                _id: { $ne: req.params.id },
            });

            if (existingCompanyCode) {
                return res.status(400).json({
                    success: false,
                    message: "Company code already exists",
                });
            }

            company.companyCode = companyCode.toUpperCase();
        }

        // Check Official Email
        if (officialEmail) {
            const existingEmail = await Company.findOne({
                officialEmail: officialEmail.toLowerCase(),
                _id: { $ne: req.params.id },
            });

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Official email already exists",
                });
            }

            company.officialEmail = officialEmail.toLowerCase();
        }

        // Update remaining fields
        if (companyName) company.companyName = companyName;
        if (companyLogo) company.companyLogo = companyLogo;
        if (companyType) company.companyType = companyType;
        if (industry) company.industry = industry;
        if (contactNumber) company.contactNumber = contactNumber;
        if (website) company.website = website;
        if (addressLine1) company.addressLine1 = addressLine1;
        if (city) company.city = city;
        if (state) company.state = state;
        if (country) company.country = country;
        if (pincode) company.pincode = pincode;
        if (timeZone) company.timeZone = timeZone;
        if (currency) company.currency = currency;
        if (workingDays) company.workingDays = workingDays;
        if (officeStartTime) company.officeStartTime = officeStartTime;
        if (officeEndTime) company.officeEndTime = officeEndTime;
        if (status) company.status = status;

        company.updatedBy = req.user._id;

        await company.save();

        return res.status(200).json({
            success: true,
            message: "Company updated successfully",
            company,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update company",
            error: error.message,
        });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.companyId);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Company deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete company",
            error: error.message,
        });
    }
};

