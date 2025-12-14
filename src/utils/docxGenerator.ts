import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export interface TemplateData {
  templateType: string;
  orgName: string;
  location: {
    country?: string;
    stateProvince?: string;
  };
  eligibility: {
    entityType?: string;
    annualRevenue?: string;
    primaryFields?: string[];
    demographics?: string[];
    projectStage?: string;
    fiscalSponsor?: string;
  };
  projectTitle: string;
  projectSummary: string;
  requestedAmount: string;
  projectDuration: string;
  targetBeneficiaries: string;
  measurableOutcomes: string;
}

export async function generateAndDownloadDOCX(data: TemplateData) {
  const doc = createDocument(data);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.templateType}-application-${Date.now()}.docx`);
}

function createDocument(data: TemplateData): Document {
  const { templateType, orgName, location, eligibility, projectTitle, projectSummary, requestedAmount, projectDuration, targetBeneficiaries, measurableOutcomes } = data;

  let sections: Paragraph[] = [];

  if (templateType === 'federal') {
    sections = createFederalTemplate(data);
  } else if (templateType === 'foundation') {
    sections = createFoundationTemplate(data);
  } else if (templateType === 'corporate') {
    sections = createCorporateTemplate(data);
  } else if (templateType === 'arts') {
    sections = createArtsTemplate(data);
  }

  return new Document({
    sections: [{
      properties: {},
      children: sections,
    }],
  });
}

function createFederalTemplate(data: TemplateData): Paragraph[] {
  const { orgName, location, eligibility, projectTitle, projectSummary, requestedAmount, projectDuration, targetBeneficiaries, measurableOutcomes } = data;

  return [
    new Paragraph({
      text: 'FEDERAL GRANT APPLICATION',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: 'APPLICANT INFORMATION',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Organization Name: ', bold: true }),
        new TextRun(orgName),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Address: ', bold: true }),
        new TextRun(`${location.stateProvince || 'N/A'}, ${location.country || 'N/A'}`),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Legal Status: ', bold: true }),
        new TextRun(eligibility.entityType || 'N/A'),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Annual Budget: ', bold: true }),
        new TextRun(eligibility.annualRevenue || 'N/A'),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'PROJECT INFORMATION',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Project Title: ', bold: true }),
        new TextRun(projectTitle || '[Enter project title]'),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'Project Summary (250 words max):',
      bold: true,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: projectSummary || '[Provide a brief overview of your project, including its purpose, target population, and expected outcomes]',
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Amount Requested: ', bold: true }),
        new TextRun(requestedAmount || '[Enter amount]'),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Project Duration: ', bold: true }),
        new TextRun(projectDuration || '[e.g., 12 months]'),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'NEED STATEMENT',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: `${eligibility.primaryFields?.join(', ') || '[Your field]'} organizations in ${location.stateProvince || '[location]'} face critical challenges that this project will address.`,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'TARGET BENEFICIARIES',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: targetBeneficiaries || '[Describe who will benefit from this project, including any demographic focus]',
      spacing: { after: 100 },
    }),
    ...(eligibility.demographics && eligibility.demographics.length > 0 ? [
      new Paragraph({
        text: `This project specifically serves: ${eligibility.demographics.join(', ')}`,
        spacing: { after: 200 },
      }),
    ] : []),
    new Paragraph({
      text: 'PROJECT GOALS AND OBJECTIVES',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: '[List 3-5 SMART goals that align with the funder\'s priorities]',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'MEASURABLE OUTCOMES',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: measurableOutcomes || '[List specific, quantifiable outcomes you will track]',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'ORGANIZATIONAL CAPACITY',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: `${orgName} is at the ${eligibility.projectStage || 'operational'} stage. ${eligibility.fiscalSponsor === 'Yes' ? 'We have a 501(c)(3) fiscal sponsor.' : ''}`,
      spacing: { after: 200 },
    }),
  ];
}

function createFoundationTemplate(data: TemplateData): Paragraph[] {
  const { orgName, location, eligibility, projectTitle, projectSummary, requestedAmount, projectDuration, targetBeneficiaries, measurableOutcomes } = data;

  return [
    new Paragraph({
      text: 'PRIVATE FOUNDATION GRANT PROPOSAL',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Organization: ', bold: true }),
        new TextRun(orgName),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Location: ', bold: true }),
        new TextRun(`${location.stateProvince}, ${location.country}`),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Mission Alignment: ', bold: true }),
        new TextRun(eligibility.primaryFields?.join(', ') || '[Your mission]'),
      ],
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: 'EXECUTIVE SUMMARY',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: projectSummary || '[1-2 paragraph overview of your request]',
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'PROJECT TITLE: ', bold: true }),
        new TextRun(projectTitle || '[Enter title]'),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'AMOUNT REQUESTED: ', bold: true }),
        new TextRun(requestedAmount || '[Enter amount]'),
      ],
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: 'THE OPPORTUNITY',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: `Our ${eligibility.projectStage || 'established'} organization serves ${eligibility.demographics?.join(', ') || 'the community'} in ${location.stateProvince}.`,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'EXPECTED OUTCOMES',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: measurableOutcomes || '[List specific, measurable results]',
      spacing: { after: 200 },
    }),
  ];
}

function createCorporateTemplate(data: TemplateData): Paragraph[] {
  const { orgName, location, eligibility, projectTitle, projectSummary, requestedAmount, projectDuration, targetBeneficiaries, measurableOutcomes } = data;

  return [
    new Paragraph({
      text: 'CORPORATE GIVING PROPOSAL',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'TO: ', bold: true }),
        new TextRun('[Corporate Foundation Name]'),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'FROM: ', bold: true }),
        new TextRun(orgName),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'DATE: ', bold: true }),
        new TextRun(new Date().toLocaleDateString()),
      ],
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: 'PARTNERSHIP OPPORTUNITY',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: `We are seeking ${requestedAmount || '[amount]'} to support ${projectTitle || '[project name]'}.`,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'PROJECT OVERVIEW',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: projectSummary || '[Brief project description]',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'MEASURABLE IMPACT',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: measurableOutcomes || '[Specific metrics your company can report on]',
      spacing: { after: 200 },
    }),
  ];
}

function createArtsTemplate(data: TemplateData): Paragraph[] {
  const { orgName, location, eligibility, projectTitle, projectSummary, requestedAmount, projectDuration, targetBeneficiaries, measurableOutcomes } = data;

  return [
    new Paragraph({
      text: 'ARTS & CULTURE GRANT APPLICATION',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: 'ORGANIZATION',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Name: ', bold: true }),
        new TextRun(orgName),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Location: ', bold: true }),
        new TextRun(`${location.stateProvince}, ${location.country}`),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Artistic Discipline: ', bold: true }),
        new TextRun(eligibility.primaryFields?.includes('Arts & Culture') ? eligibility.primaryFields.join(', ') : 'Arts & Culture'),
      ],
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: 'PROJECT TITLE',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: projectTitle || '[Enter creative project title]',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'ARTISTIC VISION',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: projectSummary || '[Describe your artistic vision and how this project advances your creative practice]',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'IMPACT & EVALUATION',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      text: measurableOutcomes || '[How will you measure artistic and community impact?]',
      spacing: { after: 200 },
    }),
  ];
}
