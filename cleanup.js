const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (let r of replacements) {
    content = content.split(r[0]).join(r[1]);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content);
  }
}

// Auth Alerts
replaceInFile('src/screens/auth/ForgotPasswordScreen.tsx', [
  ["Alert.alert('✅ Email enviado'", "Alert.alert('Email enviado'"]
]);
replaceInFile('src/screens/syndic/CreateEditUserScreen.tsx', [
  ["Alert.alert('✅ Sucesso'", "Alert.alert('Sucesso'"],
  ["Alert.alert('✅ Usuário criado'", "Alert.alert('Usuário criado'"]
]);
replaceInFile('src/screens/shared/profile/ProfileScreen.tsx', [
  ["Alert.alert('✅ Perfil atualizado'", "Alert.alert('Perfil atualizado'"]
]);
replaceInFile('src/screens/shared/reservations/CreateReservationScreen.tsx', [
  ["Alert.alert('✅ Reserva enviada'", "Alert.alert('Reserva enviada'"]
]);
replaceInFile('src/screens/shared/visitors/VisitorDetailScreen.tsx', [
  ["Alert.alert('✅ Entrada registrada'", "Alert.alert('Entrada registrada'"],
  ["Alert.alert('👋 Saída registrada'", "Alert.alert('Saída registrada'"],
  ["Alert.alert('🚫 Entrada negada'", "Alert.alert('Entrada negada'"]
]);
replaceInFile('src/screens/gatekeeper/ScanQRScreen.tsx', [
  ["Alert.alert('✅ Entrada registrada'", "Alert.alert('Entrada registrada'"],
  ["Alert.alert('👋 Saída registrada'", "Alert.alert('Saída registrada'"],
  ["Alert.alert('❌ Não encontrado'", "Alert.alert('Não encontrado'"],
  ["Alert.alert('🚶 Entrada registrada'", "Alert.alert('Entrada registrada'"],
  ["title=\"👋 Registrar saída\"", "title=\"Registrar saída\""],
  ["title=\"✅ Registrar entrada\"", "title=\"Registrar entrada\""],
  ["<Text style={styles.helpTitle}>ℹ️ Como usar</Text>", "<Text style={styles.helpTitle}>Como usar</Text>"],
  ["<Text style={styles.helpText}>📷 Aponte a câmera", "<Text style={styles.helpText}>Aponte a câmera"],
  ["<Text style={styles.statusText}>⏳ Aguarde", "<Text style={styles.statusText}>Aguarde"],
  ["<Text style={styles.errorText}>❌ Não encontrado", "<Text style={styles.errorText}>Não encontrado"],
  ["<Text style={styles.rescanText}>🔄 Tentar novamente", "<Text style={styles.rescanText}>Tentar novamente"],
  ["<Text style={styles.cameraText}>📷</Text>", ""] // already replaced if we want to remove, or keep
]);

// Map Screen
replaceInFile('src/screens/shared/map/CondominiumMapScreen.tsx', [
  ["<Text style={styles.legendText}>🔐 Portaria</Text>", "<Text style={styles.legendText}>Portaria</Text>"],
  ["<Text style={styles.legendText}>🏢 Blocos Residenciais</Text>", "<Text style={styles.legendText}>Blocos Residenciais</Text>"],
  ["<Text style={styles.legendText}>🏊 Piscina / Lazer</Text>", "<Text style={styles.legendText}>Piscina / Lazer</Text>"],
  ["<Text style={styles.legendText}>🎉 Salão de Festas</Text>", "<Text style={styles.legendText}>Salão de Festas</Text>"],
  ["<Text style={styles.legendText}>🔥 Churrasqueiras</Text>", "<Text style={styles.legendText}>Churrasqueiras</Text>"],
  ["<Text style={styles.legendText}>🚗 Estacionamento</Text>", "<Text style={styles.legendText}>Estacionamento</Text>"],
  ["<Text style={styles.legendText}>🌳 Áreas Verdes</Text>", "<Text style={styles.legendText}>Áreas Verdes</Text>"],
  ["{ block: 'A', x: 70, y: 150, icon: '🏢' }", "{ block: 'A', x: 70, y: 150, icon: 'BLOCO' }"],
  ["{ block: 'B', x: 230, y: 150, icon: '🏢' }", "{ block: 'B', x: 230, y: 150, icon: 'BLOCO' }"],
  ["{ block: 'C', x: 70, y: 350, icon: '🏢' }", "{ block: 'C', x: 70, y: 350, icon: 'BLOCO' }"],
  ["{ block: 'D', x: 230, y: 350, icon: '🏢' }", "{ block: 'D', x: 230, y: 350, icon: 'BLOCO' }"],
  ["<Text style={styles.pinIcon}>{pin.icon}</Text>", "<Text style={styles.pinIcon}>{pin.block ? 'B' : 'O'}</Text>"],
  ["<Text style={styles.facilityIcon}>🏊</Text>", ""],
  ["<Text style={styles.facilityIcon}>🎉</Text>", ""],
  ["<Text style={styles.facilityIcon}>🔐</Text>", ""],
  ["<Text style={styles.userDot}>📍</Text>", ""]
]);

// Notices
replaceInFile('src/screens/shared/notices/CreateEditNoticeScreen.tsx', [
  ["label=\"Baixa 🟢\"", "label=\"Baixa\""],
  ["label=\"Média 🟡\"", "label=\"Média\""],
  ["label=\"Alta 🔴\"", "label=\"Alta\""],
  ["label=\"Urgente 🚨\"", "label=\"Urgente\""],
  ["<Text style={styles.pinIcon}>📌</Text>", ""]
]);

// Votings
replaceInFile('src/screens/shared/votings/CreateVotingScreen.tsx', [
  ["<Text style={styles.dateHint}>📅", "<Text style={styles.dateHint}>"],
  ["<Text style={styles.optionDot}>🔘</Text>", "<View style={styles.optionDot} />"],
  ["<Text style={styles.removeText}>✕</Text>", "<Text style={styles.removeText}>X</Text>"]
]);
replaceInFile('src/screens/shared/votings/VotingsListScreen.tsx', [
  ["title=\"✅ Encerrar\"", "title=\"Encerrar\""]
]);

// Profile Screen
replaceInFile('src/screens/shared/profile/ProfileScreen.tsx', [
  ["<Text style={styles.infoLabel}>✉️ Email</Text>", "<Text style={styles.infoLabel}>Email</Text>"],
  ["<Text style={styles.infoLabel}>📱 Telefone</Text>", "<Text style={styles.infoLabel}>Telefone</Text>"],
  ["<Text style={styles.infoLabel}>🏗️ Bloco</Text>", "<Text style={styles.infoLabel}>Bloco</Text>"],
  ["<Text style={styles.infoLabel}>🚪 Apartamento</Text>", "<Text style={styles.infoLabel}>Apartamento</Text>"]
]);

// Users List
replaceInFile('src/screens/syndic/UsersListScreen.tsx', [
  ["<Text style={styles.detail}>🏠", "<Text style={styles.detail}>"],
  ["<Text style={styles.detail}>🔐", "<Text style={styles.detail}>"]
]);

console.log('Cleanup finished.');
