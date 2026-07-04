const { z } = require("zod");

const numericId = z.string().regex(/^\d+$/, "Id must be a number");
const numericString = (fieldName) => z.union([z.string(), z.number()])
    .transform((value) => String(value))
    .refine((value) => /^\d+$/.test(value), `${fieldName} must be a number`);

const studentBodySchema = z.object({
    name: z.string().min(1, "Name is required"),
    gender: z.string().min(1, "Gender is required"),
    dob: z.string().min(1, "Date of birth is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email("Email must be valid"),
    class: z.string().min(1, "Class is required"),
    section: z.string().min(1, "Section is required"),
    roll: numericString("Roll"),
    admissionDate: z.string().min(1, "Admission date is required"),
    currentAddress: z.string().min(1, "Current address is required"),
    permanentAddress: z.string().min(1, "Permanent address is required"),
    fatherName: z.string().min(1, "Father name is required"),
    fatherPhone: z.string().optional(),
    motherName: z.string().optional(),
    motherPhone: z.string().optional(),
    guardianName: z.string().min(1, "Guardian name is required"),
    guardianPhone: z.string().min(1, "Guardian phone is required"),
    relationOfGuardian: z.string().min(1, "Relation of guardian is required"),
    systemAccess: z.boolean().optional()
});

const StudentQuerySchema = z.object({
    query: z.object({
        name: z.string().optional(),
        class: z.string().optional(),
        section: z.string().optional(),
        roll: numericString("Roll").optional()
    })
});

const StudentIdParamSchema = z.object({
    params: z.object({
        id: numericId
    })
});

const AddStudentSchema = z.object({
    body: studentBodySchema
});

const UpdateStudentSchema = StudentIdParamSchema.extend({
    body: studentBodySchema
});

const StudentStatusSchema = StudentIdParamSchema.extend({
    body: z.object({
        status: z.boolean()
    })
});

module.exports = {
    AddStudentSchema,
    StudentQuerySchema,
    StudentIdParamSchema,
    StudentStatusSchema,
    UpdateStudentSchema
};
