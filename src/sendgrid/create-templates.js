const fs = require("fs");
const path = require("path");
const https = require("https");

// Get API key from environment variable
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  console.error("Error: SENDGRID_API_KEY environment variable is not set");
  process.exit(1);
}

// Function to make SendGrid API requests
function sendGridRequest(method, endpoint, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.sendgrid.com",
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`SendGrid API error (${res.statusCode}): ${body}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Function to get all existing templates
async function getExistingTemplates() {
  try {
    const response = await sendGridRequest(
      "GET",
      "/v3/templates?generations=dynamic&page_size=200"
    );
    return response.result || response.templates || [];
  } catch (error) {
    console.error("Error fetching templates:", error.message);
    return [];
  }
}

// Function to find template by name
async function findTemplateByName(name) {
  const templates = await getExistingTemplates();
  return templates.find((template) => template.name === name);
}

// Function to get the active version of a template
async function getActiveVersion(templateId) {
  try {
    const versions = await sendGridRequest(
      "GET",
      `/v3/templates/${templateId}/versions`
    );
    return versions.templates?.find((v) => v.active === 1);
  } catch (error) {
    console.error(
      `Error fetching versions for template ${templateId}:`,
      error.message
    );
    return null;
  }
}

// Function to deactivate all versions of a template
async function deactivateAllVersions(templateId) {
  try {
    const versions = await sendGridRequest(
      "GET",
      `/v3/templates/${templateId}/versions`
    );
    const activeVersions = (versions.templates || []).filter(
      (v) => v.active === 1
    );

    for (const version of activeVersions) {
      await sendGridRequest(
        "PATCH",
        `/v3/templates/${templateId}/versions/${version.id}`,
        {
          active: 0,
        }
      );
    }
  } catch (error) {
    console.error(`Error deactivating versions:`, error.message);
  }
}

// Function to create or update a template
async function createOrUpdateTemplate(name, htmlContent) {
  try {
    console.log(`\n📧 Processing template: ${name}`);

    // Check if template already exists
    const existingTemplate = await findTemplateByName(name);

    let templateId;

    if (existingTemplate) {
      console.log(
        `   ℹ️  Template already exists (ID: ${existingTemplate.id})`
      );
      console.log(`   🔄 Creating new version...`);
      templateId = existingTemplate.id;

      // Deactivate all existing versions first
      await deactivateAllVersions(templateId);
    } else {
      console.log(`   ✨ Creating new template...`);

      // Create the template
      const template = await sendGridRequest("POST", "/v3/templates", {
        name: name,
        generation: "dynamic",
      });

      templateId = template.id;
      console.log(`   ✅ Template created with ID: ${templateId}`);
    }

    // Create the new version
    const versionName = existingTemplate
      ? `Updated ${new Date().toISOString().split("T")[0]}`
      : "Initial Version";

    const version = await sendGridRequest(
      "POST",
      `/v3/templates/${templateId}/versions`,
      {
        name: versionName,
        subject: name.includes("Drive Request")
          ? "🚗 New Drive Request for Your Car"
          : "📊 Weekly Report Submitted",
        html_content: htmlContent,
        active: 1,
      }
    );

    console.log(`   ✅ Version created and activated`);

    return templateId;
  } catch (error) {
    console.error(`   ❌ Error processing template "${name}":`, error.message);
    throw error;
  }
}

// Main function
async function main() {
  console.log("🚀 Starting SendGrid template creation...\n");
  console.log("=".repeat(60));

  try {
    // Read HTML files
    const driveRequestHtml = fs.readFileSync(
      path.join(__dirname, "templates", "drive-request.html"),
      "utf8"
    );

    const weeklyReportHtml = fs.readFileSync(
      path.join(__dirname, "templates", "weekly-report.html"),
      "utf8"
    );

    // Create or update templates
    const driveRequestTemplateId = await createOrUpdateTemplate(
      "Drive Request Notification - mo kumbi",
      driveRequestHtml
    );

    const weeklyReportTemplateId = await createOrUpdateTemplate(
      "Weekly Report Submitted - mo kumbi",
      weeklyReportHtml
    );

    // Output results
    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 SUCCESS! Templates processed successfully!\n");
    console.log("Add these to your Supabase environment variables:\n");
    console.log(`SENDGRID_DRIVE_REQUEST_TEMPLATE_ID=${driveRequestTemplateId}`);
    console.log(`SENDGRID_WEEKLY_REPORT_TEMPLATE_ID=${weeklyReportTemplateId}`);
    console.log("\n" + "=".repeat(60));

    // Save template IDs to a file for reference
    const templateIds = {
      SENDGRID_DRIVE_REQUEST_TEMPLATE_ID: driveRequestTemplateId,
      SENDGRID_WEEKLY_REPORT_TEMPLATE_ID: weeklyReportTemplateId,
      created_at: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(__dirname, "template-ids.json"),
      JSON.stringify(templateIds, null, 2)
    );

    console.log("\n📝 Template IDs saved to: src/sendgrid/template-ids.json\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
