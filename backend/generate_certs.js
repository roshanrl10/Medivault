const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
}

// Generate new key pair
const keys = forge.pki.rsa.generateKeyPair(2048);

// Create certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
    name: 'commonName',
    value: 'localhost'
}, {
    name: 'countryName',
    value: 'US'
}, {
    shortName: 'ST',
    value: 'State'
}, {
    name: 'localityName',
    value: 'City'
}, {
    name: 'organizationName',
    value: 'Medivault'
}, {
    shortName: 'OU',
    value: 'Development'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// self-sign
cert.sign(keys.privateKey, forge.md.sha256.create());

// Save to file
const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
const pemCert = forge.pki.certificateToPem(cert);

fs.writeFileSync(path.join(certDir, 'server.key'), pemKey);
fs.writeFileSync(path.join(certDir, 'server.crt'), pemCert);

console.log('✅ Certificates generated successfully in /certificates');
