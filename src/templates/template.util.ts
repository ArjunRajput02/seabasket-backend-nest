import { readFileSync } from 'fs';
import { join } from 'path';

const SHARED_TEMPLATES_DIR = join(__dirname, 'shared');

type TemplateVariables = Record<string, string>;

function interpolate(template: string, variables: TemplateVariables): string {
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] : match,
  );
}

function readTemplateFile(...segments: string[]): string {
  return readFileSync(join(...segments), 'utf-8');
}

export function renderEmailTemplate(
  templateName: string,
  variables: TemplateVariables,
): { subject: string; html: string } {
  const templateDir = join(__dirname, templateName);

  const header = readTemplateFile(SHARED_TEMPLATES_DIR, 'header.html');
  const footer = readTemplateFile(SHARED_TEMPLATES_DIR, 'footer.html');
  const body = readTemplateFile(templateDir, 'body.html');
  const subject = readTemplateFile(templateDir, 'subject.txt').trim();

  const allVariables = {
    ...variables,
    currentYear: String(new Date().getFullYear()),
  };

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SeaBasket</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7fb;padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.06);">
            <tr>
              <td>${header}</td>
            </tr>
            <tr>
              <td style="padding:40px 35px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td>${footer}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  return {
    subject: interpolate(subject, allVariables),
    html: interpolate(html, allVariables),
  };
}
