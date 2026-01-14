// Script pour mettre à jour les adresses dans les données de démo
// Sépare les adresses complètes en: address, city, postal_code, country

const fs = require('fs');
const path = require('path');

const demoFilePath = path.join(__dirname, '../src/stores/demo.js');
let content = fs.readFileSync(demoFilePath, 'utf8');

// Liste des adresses à remplacer (format: ancienne adresse complète -> nouveaux champs)
const addressMappings = [
  // Prospects USA
  { old: "'350 5th Avenue, New York, NY 10118'", address: "'350 5th Avenue'", city: "'New York'", postal_code: "'10118'", country: "'USA'" },
  { old: "'1201 3rd Avenue, Seattle, WA 98101'", address: "'1201 3rd Avenue'", city: "'Seattle'", postal_code: "'98101'", country: "'USA'" },
  { old: "'1601 Elm Street, Dallas, TX 75201'", address: "'1601 Elm Street'", city: "'Dallas'", postal_code: "'75201'", country: "'USA'" },
  { old: "'1500 Broadway, Denver, CO 80202'", address: "'1500 Broadway'", city: "'Denver'", postal_code: "'80202'", country: "'USA'" },
  { old: "'1000 S Congress Ave, Austin, TX 78704'", address: "'1000 S Congress Ave'", city: "'Austin'", postal_code: "'78704'", country: "'USA'" },
  { old: "'233 S Wacker Drive, Chicago, IL 60606'", address: "'233 S Wacker Drive'", city: "'Chicago'", postal_code: "'60606'", country: "'USA'" },
  { old: "'201 Mission Street, San Francisco, CA 94105'", address: "'201 Mission Street'", city: "'San Francisco'", postal_code: "'94105'", country: "'USA'" },
  { old: "'10 E 53rd Street, New York, NY 10022'", address: "'10 E 53rd Street'", city: "'New York'", postal_code: "'10022'", country: "'USA'" },
  { old: "'5800 Sunset Blvd, Los Angeles, CA 90028'", address: "'5800 Sunset Blvd'", city: "'Los Angeles'", postal_code: "'90028'", country: "'USA'" },
  { old: "'1455 Market Street, San Francisco, CA 94103'", address: "'1455 Market Street'", city: "'San Francisco'", postal_code: "'94103'", country: "'USA'" },
  { old: "'1717 Main Street, Houston, TX 77002'", address: "'1717 Main Street'", city: "'Houston'", postal_code: "'77002'", country: "'USA'" },
  { old: "'1100 Peachtree Street NE, Atlanta, GA 30309'", address: "'1100 Peachtree Street NE'", city: "'Atlanta'", postal_code: "'30309'", country: "'USA'" },
  { old: "'1 Ford Road, Dearborn, MI 48126'", address: "'1 Ford Road'", city: "'Dearborn'", postal_code: "'48126'", country: "'USA'" },
  { old: "'500 Boylston Street, Boston, MA 02116'", address: "'500 Boylston Street'", city: "'Boston'", postal_code: "'02116'", country: "'USA'" },
  { old: "'2000 W Loop S, Houston, TX 77027'", address: "'2000 W Loop S'", city: "'Houston'", postal_code: "'77027'", country: "'USA'" },
  { old: "'3400 Civic Center Blvd, Philadelphia, PA 19104'", address: "'3400 Civic Center Blvd'", city: "'Philadelphia'", postal_code: "'19104'", country: "'USA'" },
  { old: "'1 Microsoft Way, Redmond, WA 98052'", address: "'1 Microsoft Way'", city: "'Redmond'", postal_code: "'98052'", country: "'USA'" },
  { old: "'100 Oracle Parkway, Redwood City, CA 94065'", address: "'100 Oracle Parkway'", city: "'Redwood City'", postal_code: "'94065'", country: "'USA'" },
  { old: "'200 Santana Row, San Jose, CA 95128'", address: "'200 Santana Row'", city: "'San Jose'", postal_code: "'95128'", country: "'USA'" },
  { old: "'1000 Elm Street, Manchester, NH 03101'", address: "'1000 Elm Street'", city: "'Manchester'", postal_code: "'03101'", country: "'USA'" },
  { old: "'1455 Pennsylvania Ave NW, Washington, DC 20004'", address: "'1455 Pennsylvania Ave NW'", city: "'Washington'", postal_code: "'20004'", country: "'USA'" },
  { old: "'600 Congress Ave, Austin, TX 78701'", address: "'600 Congress Ave'", city: "'Austin'", postal_code: "'78701'", country: "'USA'" },
  { old: "'8701 Georgia Ave, Silver Spring, MD 20910'", address: "'8701 Georgia Ave'", city: "'Silver Spring'", postal_code: "'20910'", country: "'USA'" },
  { old: "'4560 Horton Street, Emeryville, CA 94608'", address: "'4560 Horton Street'", city: "'Emeryville'", postal_code: "'94608'", country: "'USA'" },
  { old: "'1800 N Lamar Blvd, Austin, TX 78701'", address: "'1800 N Lamar Blvd'", city: "'Austin'", postal_code: "'78701'", country: "'USA'" },
  { old: "'2100 Milvia Street, Berkeley, CA 94704'", address: "'2100 Milvia Street'", city: "'Berkeley'", postal_code: "'94704'", country: "'USA'" },
  { old: "'1000 2nd Avenue, Seattle, WA 98104'", address: "'1000 2nd Avenue'", city: "'Seattle'", postal_code: "'98104'", country: "'USA'" },
  { old: "'3000 E 1st Avenue, Denver, CO 80206'", address: "'3000 E 1st Avenue'", city: "'Denver'", postal_code: "'80206'", country: "'USA'" },
  { old: "'500 W Madison Street, Chicago, IL 60661'", address: "'500 W Madison Street'", city: "'Chicago'", postal_code: "'60661'", country: "'USA'" },
  // Europe
  { old: "'35 Rue Joseph Monier, Rueil-Malmaison, 92500, France'", address: "'35 Rue Joseph Monier'", city: "'Rueil-Malmaison'", postal_code: "'92500'", country: "'France'" },
  { old: "'Petuelring 130, Munich, 80788, Germany'", address: "'Petuelring 130'", city: "'Munich'", postal_code: "'80788'", country: "'Germany'" },
  { old: "'Carrer de Badajoz 97, Barcelona, 08018, Spain'", address: "'Carrer de Badajoz 97'", city: "'Barcelona'", postal_code: "'08018'", country: "'Spain'" },
  { old: "'Via Tortona 27, Milan, 20144, Italy'", address: "'Via Tortona 27'", city: "'Milan'", postal_code: "'20144'", country: "'Italy'" },
  // Companies
  { old: "'1 Market Street, San Francisco, CA 94105'", address: "'1 Market Street'", city: "'San Francisco'", postal_code: "'94105'", country: "'USA'" },
  { old: "'2001 Ross Avenue, Dallas, TX 75201'", address: "'2001 Ross Avenue'", city: "'Dallas'", postal_code: "'75201'", country: "'USA'" },
  { old: "'200 Clarendon Street, Boston, MA 02116'", address: "'200 Clarendon Street'", city: "'Boston'", postal_code: "'02116'", country: "'USA'" },
  { old: "'1918 8th Avenue, Seattle, WA 98101'", address: "'1918 8th Avenue'", city: "'Seattle'", postal_code: "'98101'", country: "'USA'" },
  { old: "'1301 Fannin Street, Houston, TX 77002'", address: "'1301 Fannin Street'", city: "'Houston'", postal_code: "'77002'", country: "'USA'" },
  { old: "'1600 JFK Boulevard, Philadelphia, PA 19103'", address: "'1600 JFK Boulevard'", city: "'Philadelphia'", postal_code: "'19103'", country: "'USA'" },
  { old: "'11921 Rockville Pike, Rockville, MD 20852'", address: "'11921 Rockville Pike'", city: "'Rockville'", postal_code: "'20852'", country: "'USA'" },
  { old: "'98 San Jacinto Boulevard, Austin, TX 78701'", address: "'98 San Jacinto Boulevard'", city: "'Austin'", postal_code: "'78701'", country: "'USA'" },
  { old: "'1999 Broadway, Denver, CO 80202'", address: "'1999 Broadway'", city: "'Denver'", postal_code: "'80202'", country: "'USA'" },
  { old: "'1200 Smith Street, Houston, TX 77002'", address: "'1200 Smith Street'", city: "'Houston'", postal_code: "'77002'", country: "'USA'" },
  { old: "'301 Congress Avenue, Austin, TX 78701'", address: "'301 Congress Avenue'", city: "'Austin'", postal_code: "'78701'", country: "'USA'" },
  { old: "'200 E Randolph Street, Chicago, IL 60601'", address: "'200 E Randolph Street'", city: "'Chicago'", postal_code: "'60601'", country: "'USA'" },
  { old: "'100 Renaissance Center, Detroit, MI 48243'", address: "'100 Renaissance Center'", city: "'Detroit'", postal_code: "'48243'", country: "'USA'" },
  { old: "'5800 Sunset Boulevard, Los Angeles, CA 90028'", address: "'5800 Sunset Boulevard'", city: "'Los Angeles'", postal_code: "'90028'", country: "'USA'" },
  { old: "'1 World Trade Center, New York, NY 10007'", address: "'1 World Trade Center'", city: "'New York'", postal_code: "'10007'", country: "'USA'" },
  { old: "'100 Federal Street, Boston, MA 02110'", address: "'100 Federal Street'", city: "'Boston'", postal_code: "'02110'", country: "'USA'" },
  { old: "'9500 Gilman Drive, La Jolla, CA 92093'", address: "'9500 Gilman Drive'", city: "'La Jolla'", postal_code: "'92093'", country: "'USA'" },
  { old: "'535 Mission Street, San Francisco, CA 94105'", address: "'535 Mission Street'", city: "'San Francisco'", postal_code: "'94105'", country: "'USA'" },
  { old: "'2600 Campus Drive, San Mateo, CA 94403'", address: "'2600 Campus Drive'", city: "'San Mateo'", postal_code: "'94403'", country: "'USA'" },
  { old: "'1166 Avenue of the Americas, New York, NY 10036'", address: "'1166 Avenue of the Americas'", city: "'New York'", postal_code: "'10036'", country: "'USA'" }
];

// Fonction pour remplacer une adresse complète par ses composants
function replaceAddress(text, mapping) {
  const addressRegex = new RegExp(`address:\\s*${mapping.old.replace(/'/g, "\\'")}`, 'g');
  
  // Remplacement : address: 'full address' devient address: 'street', city: 'city', postal_code: 'zip', country: 'country'
  return text.replace(addressRegex, 
    `address: ${mapping.address},\n        city: ${mapping.city},\n        postal_code: ${mapping.postal_code},\n        country: ${mapping.country}`
  );
}

// Appliquer tous les remplacements
addressMappings.forEach(mapping => {
  content = replaceAddress(content, mapping);
});

// Écrire le fichier mis à jour
fs.writeFileSync(demoFilePath, content, 'utf8');

console.log('✅ Demo addresses updated successfully!');
console.log(`📝 Updated ${addressMappings.length} addresses in demo.js`);
