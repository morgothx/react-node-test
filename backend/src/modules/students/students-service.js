const { ApiError, sendAccountVerificationEmail } = require("../../utils");
const { findAllStudents, findStudentDetail, findStudentToSetStatus, addOrUpdateStudent, deleteStudentById } = require("./students-repository");
const { findUserById } = require("../../shared/repository");

const checkStudentId = async (id) => {
    const isStudentFound = await findUserById(id);
    if (!isStudentFound) {
        throw new ApiError(404, "Student not found");
    }
}

const getStudentOperationError = (operation, result) => {
    const message = result?.message;
    const description = result?.description || "";

    if (message === "Email already exists") {
        return new ApiError(409, "Email already exists");
    }

    if (description.includes("user_profiles_class_name_fkey")) {
        return new ApiError(400, "Class does not exist");
    }

    if (description.includes("user_profiles_section_name_fkey")) {
        return new ApiError(400, "Section does not exist");
    }

    if (description.includes("invalid input syntax for type integer")) {
        return new ApiError(400, "Roll must be a number");
    }

    if (description.includes("invalid input syntax for type date")) {
        return new ApiError(400, "Date fields must be valid dates");
    }

    return new ApiError(500, message || `Unable to ${operation} student`);
}

const getAllStudents = async (payload) => {
    const students = await findAllStudents(payload);
    if (students.length <= 0) {
        throw new ApiError(404, "Students not found");
    }

    return students;
}

const getStudentDetail = async (id) => {
    await checkStudentId(id);

    const student = await findStudentDetail(id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return student;
}

const addNewStudent = async (payload) => {
    const ADD_STUDENT_AND_EMAIL_SEND_SUCCESS = "Student added and verification email sent successfully.";
    const ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL = "Student added, but failed to send verification email.";
    try {
        const result = await addOrUpdateStudent(payload);
        if (!result.status) {
            throw getStudentOperationError("add", result);
        }

        try {
            await sendAccountVerificationEmail({ userId: result.userId, userEmail: payload.email });
            return { message: ADD_STUDENT_AND_EMAIL_SEND_SUCCESS };
        } catch (error) {
            return { message: ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL }
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, "Unable to add student");
    }
}

const updateStudent = async (payload) => {
    const result = await addOrUpdateStudent(payload);
    if (!result.status) {
        throw getStudentOperationError("update", result);
    }

    return { message: result.message };
}

const deleteStudent = async (id) => {
    const affectedRow = await deleteStudentById(id);
    if (affectedRow <= 0) {
        throw new ApiError(404, "Student not found");
    }

    return { message: "Student deleted successfully" };
}

const setStudentStatus = async ({ userId, reviewerId, status }) => {
    await checkStudentId(userId);

    const affectedRow = await findStudentToSetStatus({ userId, reviewerId, status });
    if (affectedRow <= 0) {
        throw new ApiError(500, "Unable to disable student");
    }

    return { message: "Student status changed successfully" };
}

module.exports = {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    setStudentStatus,
    updateStudent,
    deleteStudent,
};
