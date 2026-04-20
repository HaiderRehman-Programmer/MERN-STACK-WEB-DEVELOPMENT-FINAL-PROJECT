"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCertificate = exports.enrollInCourse = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const enrollments_service_1 = require("./enrollments.service");
const pdfkit_1 = __importDefault(require("pdfkit"));
exports.enrollInCourse = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await enrollments_service_1.EnrollmentService.enroll(req.body.courseId, req.user.id);
    res.status(201).json({
        success: true,
        message: "Successfully enrolled in course",
        data: result
    });
});
exports.generateCertificate = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const enrollmentId = req.params['id'];
    const userId = req.user.id;
    const data = await enrollments_service_1.EnrollmentService.getCertificateData(enrollmentId, userId);
    const { enrollment, courseTitle, studentName } = data;
    // PDF Generation
    const doc = new pdfkit_1.default({ layout: 'landscape', size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${enrollmentId}.pdf`);
    doc.pipe(res);
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).strokeColor('#6366f1').lineWidth(5).stroke();
    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).strokeColor('#a855f7').lineWidth(2).stroke();
    doc.moveDown(4);
    doc.fillColor('#1e1b4b').fontSize(40).font('Helvetica-Bold').text('CERTIFICATE OF COMPLETION', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(16).font('Helvetica').fillColor('#64748b').text('This is to certify that', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(32).font('Helvetica-Bold').fillColor('#1e1b4b').text(studentName.toUpperCase(), { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(16).font('Helvetica').fillColor('#64748b').text('has successfully completed the course', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#4f46e5').text(`"${courseTitle}"`, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica').fillColor('#64748b').text(`Completed on ${enrollment.purchasedAt?.toLocaleDateString() || new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(4);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#94a3b8').text(`Certificate ID: ${enrollmentId}`, { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#6366f1').text('LMS PLATFORM', { align: 'center' });
    doc.end();
});
//# sourceMappingURL=enrollments.controller.js.map