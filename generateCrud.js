const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const yargs = require('yargs');
const acorn = require('acorn');
const walk = require('acorn-walk');

async function getInputs() {
  const argv = yargs
    .option('fileName', { alias: 'f', type: 'string', describe: 'File name' })
    .option('modulePath', {
      alias: 'm',
      type: 'string',
      describe: 'Module where the file should be created',
      default: 'qsite'
    })
    .option('apiRoute', { alias: 'a', type: 'string', describe: 'apiRoute (optional)', default: '' })
    .option('addColumns', { alias: 'c', type: 'boolean', describe: 'Add default columns?', default: true })
    .help()
    .argv;

  if (argv.fileName) {
    return argv;
  }

  return await inquirer.prompt([
    {
      type: 'input',
      name: 'fileName',
      message: 'Enter the file name:',
      validate: (input) => (input ? true : 'File name is required.')
    },
    {
      type: 'input',
      name: 'modulePath',
      message: 'Enter the module where the file should be created:',
      default: 'qsite'
    },
    {
      type: 'input',
      name: 'apiRoute',
      message: 'Enter the apiRoute (optional):'
    },
    {
      type: 'confirm',
      name: 'addColumns',
      message: 'Do you want to add the default columns?',
      default: true
    },
    {
      type: "number",
      name: "fieldCount",
      message: "How many fields do you want to add?",
      validate: (input) =>
        Number.isInteger(input) && input > 0
          ? true
          : "Please enter a valid number greater than 0.",
    },
  ]);
}

async function generateCrudFile() {
  const { fileName, modulePath, apiRoute, addColumns, fieldCount } = await getInputs();
  const filePath = path.join('src/modules', modulePath, '_crud');
  const fullPath = path.join(filePath, `${fileName}.vue`);

  const columns = addColumns
    ? `[
          { name: 'id', label: 'ID', field: 'id', style: 'width: 50px' },
          { name: 'name', label: 'Name', field: 'name', format: (val) => (val ? val : "-") },
          { name: "created_at", label: "Created At", field: "createdAt", align: "left" },
          { name: "updated_at", label: "Updated At", field: "updatedAt", align: "left" },
          { name: 'actions', label: 'Actions', align: 'left' }
        ]`
    : `[]`;
  let fields = {};

  for (let i = 0; i < fieldCount; i++) {
    console.log(`\n🔹 Configuring Field ${i + 1} of ${fieldCount}`);

    const field = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: `Select the type for field ${i + 1}:`,
        choices: ["input", "quantity", "select", "fullDate", "checkbox"],
      },
      {
        type: "input",
        name: "name",
        message: `Enter the name (key) for field ${i + 1}:`,
        validate: (input) => (input ? true : "Field name is required."),
      },
    ]);

    fields[field.name] = {...getDynamicFields(field.type, field.name)};
  }

  fields = JSON.stringify(fields,null, 2).replace(/"([^"]+)":/g, "$1:")
    .replace(/"([^"]+)"/g, "'$1'");

  const content = `<template>
</template>
<script>
export default {
  data() {
    return {
      crudId: this.$uid(),
    };
  },
  computed: {
    crudData() {
      return {
        crudId: this.crudId,
        apiRoute: '${apiRoute}',
        permission: 'example.permission',
        create: { title: 'Create Item' },
        read: { columns: ${columns}, filters: {}, actions: [] },
        update: { title: 'Update Item' },
        delete: true,
        formLeft: ${fields},
        formRight: {},
      };
    },
    crudInfo() {
      return this.$store.state.qcrudComponent.component[this.crudId] || {};
    },
  },
};
</script>
<style lang="stylus">
</style>`;

  fs.mkdirSync(filePath, { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log(`✅ File created at: ${fullPath}`);

  await updateAdminPages(modulePath, fileName);
  await updateAdminSidebar(modulePath, fileName);

}

async function updateAdminSidebar(modulePath, fileName) {
  const adminSidebarPath = path.join('src/modules', modulePath, '_config/adminSidebar.js');
  let adminSidebarContent = fs.existsSync(adminSidebarPath) ? fs.readFileSync(adminSidebarPath, 'utf-8') : 'import pages from \'src/setup/pages\'\n\nexport default [];';

  try {

    const ast = acorn.parse(adminSidebarContent, {
      ecmaVersion: 'latest',
      sourceType: 'module'
    });


    let arrayNode = null;
    walk.simple(ast, {
      ArrayExpression(node) {
        arrayNode = node;
      }
    });

    if (arrayNode) {

      const arrayStart = arrayNode.start;
      const arrayEnd = arrayNode.end;
      let arrayContent = adminSidebarContent.slice(arrayStart, arrayEnd);


      arrayContent = arrayContent
        .replace(/,\s*,/g, ',')
        .replace(/,\s*\]/g, ']');


      const newEntry = `  pages.${modulePath}.${fileName},`;


      if (!arrayContent.includes(newEntry.trim())) {

        arrayContent = arrayContent.replace(/\]\s*$/, `,\n${newEntry}\n]`);


        adminSidebarContent =
          adminSidebarContent.slice(0, arrayStart) + arrayContent + adminSidebarContent.slice(arrayEnd);
      }
    }
  } catch (error) {
    console.error('Error al parsear el archivo:', error);
  }

  fs.writeFileSync(adminSidebarPath, adminSidebarContent, 'utf-8');
  console.log(`✅ adminSidebar.js updated with new CRUD: ${fileName}`);
}

async function updateAdminPages(modulePath, fileName) {
  const adminPagesPath = path.join('src/modules', modulePath, '_config/adminPages.js');
  let adminPagesContent = fs.existsSync(adminPagesPath) ? fs.readFileSync(adminPagesPath, 'utf-8') : 'export default {}';

  const newCrudEntry = `
  ${fileName}: {
    activated: true,
    path: '/${fileName}/index',
    name: 'app.${fileName}.index',
    crud: import('modules/${modulePath}/_crud/${fileName}'),
    page: () => import('modules/qcrud/_pages/admin/crudPage'),
    layout: () => import('layouts/master.vue'),
    title: '${fileName}',
    icon: 'fal fa-cog',
    authenticated: true,
    subHeader: { refresh: true },
  },`;

  if (adminPagesContent.includes('export default {')) {
    // Busca el último cierre del objeto `export default`
    const lastClosingBracketIndex = adminPagesContent.lastIndexOf('}');

    // Busca el contenido antes del cierre del objeto
    const contentBeforeClosingBracket = adminPagesContent.slice(0, lastClosingBracketIndex).trim();

    // Verifica si el último carácter antes del cierre es una coma
    const lastChar = contentBeforeClosingBracket.slice(-1);
    const needsComma = lastChar !== ',' && lastChar !== '{';

    // Inserta el nuevo contenido justo antes del cierre del objeto
    adminPagesContent = contentBeforeClosingBracket +
      (needsComma ? ',' : '') + // Agrega una coma solo si es necesario
      newCrudEntry +
      adminPagesContent.slice(lastClosingBracketIndex);
  } else {
    adminPagesContent += `
export default {
  ${newCrudEntry}
};`;
  }

  fs.writeFileSync(adminPagesPath, adminPagesContent, 'utf-8');
  console.log(`✅ adminPages.js updated with new CRUD: ${fileName}`);
}

function getDynamicFields(type, name) {
  let props = {
    label: name,
  };
  if (type == "quantity" || type == "quantityFloat") {
    props = {
      label: name,
      type: "number",
      step: "0.1",
      mask: "###################",
    };
  }
  if (type == "select") {
    props = {
      label: name,
      options: [],
    };
  }
  if (type == "fullDate") {
    props = {
      label: name,
      hint: "Format: MM/DD/YYYY HH:mm",
      mask: "MM/DD/YYYY HH:mm",
      format24h: true,
    };
  }
  return {
    value: null,
    type: type,
    props: {...props}
  }
}

generateCrudFile();
