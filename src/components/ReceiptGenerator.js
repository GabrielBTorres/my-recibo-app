import React, { useState, useRef, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import numeroPorExtenso from 'numero-por-extenso';

const PROVIDER = {
  name: 'Camilla de Souza Braga',
  cpf: '05346439730',
  rg: '111298931',
  coren: '73072',
  telefone: '(21) 96427-8525',
  email: 'bragacamilla9@gmail.com',
};

export default function ReceiptGenerator() {
  const [receiptNumber, setReceiptNumber] = useState(() => {
    const saved = localStorage.getItem('receiptNumber');
    return saved ? parseInt(saved) : 1;
  });

  const [form, setForm] = useState({
    receiverName: '',
    receiverCPF: '',
    amountNumeric: '',
    amountWords: '',
    surgery: '',
    hospital: '',
    date: '',
  });

  const receiptRef = useRef();

  useEffect(() => {
    if (form.amountNumeric && !isNaN(form.amountNumeric)) {
      const extenso = numeroPorExtenso.porExtenso(parseFloat(form.amountNumeric), numeroPorExtenso.estilo.monetario);
      setForm((prev) => ({ ...prev, amountWords: extenso }));
    }
  }, [form.amountNumeric]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatReceiptNumber = (num) => {
    return String(num).padStart(3, '0');
  };

  const generatePDF = () => {
    const element = receiptRef.current;
    html2canvas(element, {
      scale: window.devicePixelRatio || 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`recibo_${formatReceiptNumber(receiptNumber)}.pdf`);
  
      const nextNumber = receiptNumber < 999 ? receiptNumber + 1 : 1;
      setReceiptNumber(nextNumber);
      localStorage.setItem('receiptNumber', nextNumber);
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Gerador de Recibos
      </Typography>
      <Box component="form" noValidate sx={{ display: 'grid', gap: 2, mb: 4 }}>
        <TextField label="Nome Cliente" name="receiverName" value={form.receiverName} onChange={handleChange} fullWidth />
        <TextField label="CPF Cliente" name="receiverCPF" value={form.receiverCPF} onChange={handleChange} fullWidth />
        <TextField label="Valor (numérico)" name="amountNumeric" value={form.amountNumeric} onChange={handleChange} fullWidth />
        <TextField label="Cirurgia realizada" name="surgery" value={form.surgery} onChange={handleChange} fullWidth />
        <TextField label="Local (hospital/clínica)" name="hospital" value={form.hospital} onChange={handleChange} fullWidth />
        <TextField
          label="Data"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </Box>
      <Button variant="contained" onClick={generatePDF} sx={{ mb: 4 }}>
        Gerar PDF
      </Button>
      <Box  ref={receiptRef}
      sx={{
        p: 4,
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        border: '1px solid #ccc',
        backgroundColor: '#fff',
                 }}>
        <Typography sx={{ fontFamily: 'cookie', fontSize: 62, textAlign: 'center' }}> {PROVIDER.name}</Typography>
        <Typography sx={{ mt: 2, fontWeight: 'bold' }}>RECIBO Nº {formatReceiptNumber(receiptNumber)}</Typography>
        <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
          CPF: {PROVIDER.cpf} - COREN: {PROVIDER.coren} - CELULAR: {PROVIDER.telefone} - EMAIL: {PROVIDER.email}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Recebi de <strong>{form.receiverName}</strong>, CPF <strong>{form.receiverCPF}</strong> a importância de <strong>{form.amountWords} (R${form.amountNumeric})</strong> referente à instrumentação cirúrgica.
        </Typography>
        <Typography sx={{ mt: 2 }}>Cirurgia realizada: <strong>{form.surgery}</strong></Typography>
        <Typography>Atendimento prestado no(a) <strong>{form.hospital}.</strong></Typography>
        <Typography sx={{ mt: 2 }}>
          Rio de Janeiro, {new Date(form.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Typography>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <img src="/assets/assinatura.png" alt="Assinatura" style={{ width: 200 }} />
         <Box sx={{ borderBottom: '2px solid #111', width: '60%', margin: '0 auto', mt: 0 }} />
          <Typography>{PROVIDER.name}</Typography>
         </Box>
      </Box>
    </Container>
  );
}
