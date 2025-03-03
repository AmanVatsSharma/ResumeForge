import { ResumeContent } from "@shared/schema";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getTemplateComponent } from "@/components/templates";
import { apiRequest } from "./queryClient";

/**
 * Exports a resume to PDF format
 * @param resumeContent The resume content to export
 * @param filename The filename to save as
 * @param templateId The ID of the template to use
 * @param templateConfig The template configuration
 */
export async function exportToPdf(
  resumeContent: ResumeContent,
  filename: string,
  templateId: string,
  templateConfig: any
): Promise<void> {
  try {
    // Create a temporary element to render the resume
    const tempElement = document.createElement("div");
    tempElement.style.position = "absolute";
    tempElement.style.left = "-9999px";
    tempElement.style.width = "21cm";
    tempElement.style.backgroundColor = "white";
    tempElement.style.padding = "30px";
    document.body.appendChild(tempElement);

    // Get the template component and render it
    // In a real implementation, this would use ReactDOM.render
    // For simplicity, we'll manually create the HTML structure
    tempElement.innerHTML = `
      <div style="font-family: ${templateConfig.font.replace('font-', '')}; max-width: 21cm; margin: 0 auto;">
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 10px;">${resumeContent.personalInfo.fullName}</h1>
        <div style="text-align: center; margin-bottom: 20px;">
          <p>${resumeContent.personalInfo.email} | ${resumeContent.personalInfo.phone} | ${resumeContent.personalInfo.location}</p>
        </div>
        
        <h2 style="font-size: 18px; margin-top: 20px; ${templateConfig.showBorders ? 'border-bottom: 1px solid #ccc;' : ''} padding-bottom: 5px;">Professional Summary</h2>
        <p style="white-space: pre-wrap;">${resumeContent.summary}</p>
        
        <h2 style="font-size: 18px; margin-top: 20px; ${templateConfig.showBorders ? 'border-bottom: 1px solid #ccc;' : ''} padding-bottom: 5px;">Experience</h2>
        <div style="white-space: pre-wrap;">${resumeContent.experience}</div>
        
        <h2 style="font-size: 18px; margin-top: 20px; ${templateConfig.showBorders ? 'border-bottom: 1px solid #ccc;' : ''} padding-bottom: 5px;">Education</h2>
        <div style="white-space: pre-wrap;">${resumeContent.education}</div>
        
        <h2 style="font-size: 18px; margin-top: 20px; ${templateConfig.showBorders ? 'border-bottom: 1px solid #ccc;' : ''} padding-bottom: 5px;">Skills</h2>
        <div style="white-space: pre-wrap;">${resumeContent.skills}</div>
      </div>
    `;

    // Convert the element to a canvas
    const canvas = await html2canvas(tempElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
    });

    // Create a PDF
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    // Add the canvas to the PDF
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    const imgWidth = pdfWidth;
    const imgHeight = imgWidth / ratio;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Save the PDF
    pdf.save(`${filename}.pdf`);

    // Clean up
    document.body.removeChild(tempElement);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
}

/**
 * Exports a resume to DOCX format (placeholder for future implementation)
 * @param resumeContent The resume content to export
 * @param templateId The ID of the template to use
 * @param filename The filename to save as
 */
export async function exportToDocx(
  resumeContent: ResumeContent,
  templateId: string,
  filename: string
): Promise<void> {
  // This is a placeholder for the DOCX export functionality
  // In a real implementation, this would use a library like docx.js
  console.log("DOCX export not implemented yet");
  return Promise.resolve();
}

/**
 * Copies resume content to the clipboard as plain text
 * @param resumeContent The resume content to copy
 */
export async function copyToClipboard(
  resumeContent: ResumeContent
): Promise<void> {
  try {
    // Format the resume content as plain text
    const plainText = `
${resumeContent.personalInfo.fullName}
${resumeContent.personalInfo.email} | ${resumeContent.personalInfo.phone} | ${resumeContent.personalInfo.location}

PROFESSIONAL SUMMARY
${resumeContent.summary}

EXPERIENCE
${resumeContent.experience}

EDUCATION
${resumeContent.education}

SKILLS
${resumeContent.skills}
`.trim();

    // Copy to clipboard
    await navigator.clipboard.writeText(plainText);
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    throw error;
  }
}

/**
 * Sends a resume as an email attachment
 * @param resumeContent The resume content to send
 * @param email The email address to send to
 * @param templateId The ID of the template to use
 * @param templateConfig The template configuration
 */
export async function emailResume(
  resumeContent: ResumeContent,
  email: string,
  templateId: string,
  templateConfig: any = {}
): Promise<void> {
  try {
    // Call the backend API to send the email
    await apiRequest("POST", "/api/resumes/email", {
      resumeContent,
      email,
      templateId,
      templateConfig,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
} 