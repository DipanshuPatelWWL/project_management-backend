const Company = require("../models/Company");
const regex = require("../utils/regexPatterns");

// Generate permanent sequential Company ID
// Soft-deleted companies are also included so IDs are never reused
const generateCompanyId = async () => {
  const companies = await Company.find({
    companyId: { $exists: true, $ne: "" },
  }).select("companyId");

  let highestNumber = 0;

  companies.forEach((company) => {
    if (company.companyId) {
      const number = parseInt(company.companyId.replace("COM", ""), 10);

      if (!isNaN(number) && number > highestNumber) {
        highestNumber = number;
      }
    }
  });

  const nextNumber = highestNumber + 1;

  return `COM${String(nextNumber).padStart(3, "0")}`;
};

exports.createCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyCode,
      companyLogo,
      companyType,
      industry,
      officialEmail,
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
    } = req.body;

    if (
      !companyName ||
      !companyCode ||
      !companyType ||
      !industry ||
      !officialEmail ||
      !contactNumber ||
      !addressLine1 ||
      !city ||
      !state ||
      !country ||
      !pincode ||
      !timeZone ||
      !currency ||
      !officeStartTime ||
      !officeEndTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const formattedCompanyCode = companyCode.trim().toUpperCase();

    const formattedEmail = officialEmail.trim().toLowerCase();

    if (!regex.email.test(formattedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (!regex.phone.test(contactNumber.trim())) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be a valid 10-digit number starting with 6, 7, 8, or 9",
      });
    }

    const isIndia = !country || country.trim().toLowerCase() === "india";
    if (isIndia) {
      if (!regex.pincode.test(pincode.trim())) {
        return res.status(400).json({
          success: false,
          message: "Pincode must be a valid 6-digit postal code",
        });
      }
    } else {
      if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(pincode.trim())) {
        return res.status(400).json({
          success: false,
          message: "Postal code must be a valid format (3-10 characters)",
        });
      }
    }

    if (officeStartTime && officeEndTime && officeEndTime <= officeStartTime) {
      return res.status(400).json({
        success: false,
        message: "Office End Time must be after Office Start Time",
      });
    }

    // FIX: only check against companies that are NOT soft-deleted,
    // so a deleted company's code/email can be reused.
    const existingCompanyCode = await Company.findOne({
      companyCode: formattedCompanyCode,
      isDeleted: false,
    });

    if (existingCompanyCode) {
      return res.status(400).json({
        success: false,
        message: "A company code already exists",
      });
    }

    const existingEmail = await Company.findOne({
      officialEmail: formattedEmail,
      isDeleted: false,
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Official email already exists",
      });
    }

    // Generate permanent Company ID only after validation
    const companyId = await generateCompanyId();

    const company = await Company.create({
      companyId,

      companyName: companyName.trim(),
      companyCode: formattedCompanyCode,
      companyLogo,
      companyType,
      industry,
      officialEmail: formattedEmail,
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
      status: status || "active",

      // Company starts as active
      isDeleted: false,

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
    // Only active (non-deleted) companies are displayed
    const companies = await Company.find({
      isDeleted: false,
    });

    // Generate preview from highest existing Company ID
    // without increasing anything
    const nextCompanyId = await generateCompanyId();

    return res.status(200).json({
      success: true,
      count: companies.length,
      message: "Companies fetched successfully",
      companies,

      // Send next Company ID preview
      nextCompanyId,
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
    // Do not return soft-deleted companies
    const company = await Company.findOne({
      _id: req.params.companyId,
      isDeleted: false,
    });

    if (!company) {
      return res.status(404).json({
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
      message: "Failed to fetch company",
      error: error.message,
    });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyCode,
      companyLogo,
      companyType,
      industry,
      officialEmail,
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
    } = req.body;

    // Only active companies can be updated
    const company = await Company.findOne({
      _id: req.params.companyId,
      isDeleted: false,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (companyCode) {
      const formattedCompanyCode = companyCode.trim().toUpperCase();

      // FIX: exclude soft-deleted companies from the
      // duplicate check here too.
      const existingCompanyCode = await Company.findOne({
        companyCode: formattedCompanyCode,
        isDeleted: false,
        _id: { $ne: req.params.companyId },
      });

      if (existingCompanyCode) {
        return res.status(400).json({
          success: false,
          message: "Company code already exists",
        });
      }

      company.companyCode = formattedCompanyCode;
    }

    if (officialEmail) {
      const formattedEmail = officialEmail.trim().toLowerCase();

      if (!regex.email.test(formattedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address",
        });
      }

      const existingEmail = await Company.findOne({
        officialEmail: formattedEmail,
        isDeleted: false,
        _id: { $ne: req.params.companyId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Official email already exists",
        });
      }

      company.officialEmail = formattedEmail;
    }

    if (companyName !== undefined) {
      company.companyName = companyName;
    }

    if (companyLogo !== undefined) {
      company.companyLogo = companyLogo;
    }

    if (companyType !== undefined) {
      company.companyType = companyType;
    }

    if (industry !== undefined) {
      company.industry = industry;
    }

    if (contactNumber !== undefined) {
      if (!regex.phone.test(contactNumber.trim())) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be a valid 10-digit number starting with 6, 7, 8, or 9",
        });
      }
      company.contactNumber = contactNumber;
    }

    if (website !== undefined) {
      company.website = website;
    }

    if (addressLine1 !== undefined) {
      company.addressLine1 = addressLine1;
    }

    if (city !== undefined) {
      company.city = city;
    }

    if (state !== undefined) {
      company.state = state;
    }

    if (country !== undefined) {
      company.country = country;
    }

    if (pincode !== undefined) {
      const targetCountry = country || company.country || "India";
      const isIndia = !targetCountry || targetCountry.trim().toLowerCase() === "india";
      if (isIndia) {
        if (!regex.pincode.test(pincode.trim())) {
          return res.status(400).json({
            success: false,
            message: "Pincode must be a valid 6-digit postal code",
          });
        }
      } else {
        if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(pincode.trim())) {
          return res.status(400).json({
            success: false,
            message: "Postal code must be a valid format (3-10 characters)",
          });
        }
      }
      company.pincode = pincode;
    }

    if (timeZone !== undefined) {
      company.timeZone = timeZone;
    }

    if (currency !== undefined) {
      company.currency = currency;
    }

    if (workingDays !== undefined) {
      company.workingDays = workingDays;
    }

    const effectiveStartTime = officeStartTime !== undefined ? officeStartTime : company.officeStartTime;
    const effectiveEndTime = officeEndTime !== undefined ? officeEndTime : company.officeEndTime;
    if (effectiveStartTime && effectiveEndTime && effectiveEndTime <= effectiveStartTime) {
      return res.status(400).json({
        success: false,
        message: "Office End Time must be after Office Start Time",
      });
    }

    if (officeStartTime !== undefined) {
      company.officeStartTime = officeStartTime;
    }

    if (officeEndTime !== undefined) {
      company.officeEndTime = officeEndTime;
    }

    if (status !== undefined) {
      company.status = status;
    }

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
    // Soft delete instead of permanently deleting the document
    const company = await Company.findOne({
      _id: req.params.companyId,
      isDeleted: false,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Keep the document in MongoDB
    company.isDeleted = true;
    company.updatedBy = req.user._id;

    await company.save();

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
