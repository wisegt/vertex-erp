<script setup lang="ts">
import sittingGirlWithLaptop from '@images/front-pages/landing-page/sitting-girl-with-laptop.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'

const faqData = [
  {
    question: '¿VERTEX está certificado para Facturación Electrónica FEL?',
    answer: 'Sí, VERTEX ERP está completamente certificado por la SAT de Guatemala para la emisión de Facturas Electrónicas en Línea (FEL). Emitimos facturas, notas de crédito, notas de débito y todos los documentos tributarios electrónicos requeridos. La certificación se renueva automáticamente y cumplimos con todas las normativas vigentes.',
  },
  {
    question: '¿Puedo migrar mis datos desde otro sistema?',
    answer: 'Absolutamente. Ofrecemos un servicio de migración de datos que incluye: catálogo de cuentas, saldos iniciales, clientes, proveedores, productos e inventario. Nuestro equipo técnico te acompaña durante todo el proceso para garantizar una transición sin pérdida de información. El tiempo de migración depende del volumen de datos, pero típicamente se completa en 1-2 semanas.',
  },
  {
    question: '¿Qué incluye el soporte técnico?',
    answer: 'Todos los planes incluyen soporte técnico por email con respuesta en 24 horas hábiles. Los planes Business y superiores incluyen soporte prioritario con chat en vivo y respuesta en menos de 4 horas. El plan Enterprise incluye un gerente de cuenta dedicado y soporte telefónico 24/7. Además, todos los usuarios tienen acceso a nuestra base de conocimientos y tutoriales en video.',
  },
  {
    question: '¿Puedo probar VERTEX antes de contratar?',
    answer: 'Sí, ofrecemos una prueba gratuita de 14 días con acceso completo a todas las funcionalidades. No requiere tarjeta de crédito para iniciar. Durante la prueba, tendrás acceso a soporte técnico y podrás cargar tus propios datos para evaluar el sistema con información real de tu negocio.',
  },
  {
    question: '¿Cómo funciona la modalidad para Contadores?',
    answer: 'La modalidad Contador está diseñada específicamente para profesionales de la contabilidad que gestionan múltiples empresas. Desde un solo panel puedes acceder a todas las empresas de tus clientes, generar reportes consolidados y cumplir con las obligaciones fiscales. Tus clientes pueden tener acceso limitado para consultas sin costo adicional.',
  },
  {
    question: '¿Mis datos están seguros en la nube?',
    answer: 'Tu información está protegida con los más altos estándares de seguridad. Utilizamos encriptación AES-256 para datos en reposo y TLS 1.3 para datos en tránsito. Realizamos respaldos automáticos cada hora y mantenemos copias en múltiples ubicaciones geográficas. Cumplimos con las mejores prácticas de seguridad de la industria y realizamos auditorías de seguridad periódicas.',
  },
]
</script>

<template>
  <VContainer id="faq">
    <div class="faq-section">
      <div class="headers d-flex justify-center flex-column align-center my-12">
        <div class="d-flex gap-x-3 mb-6">
          <img
            :src="sectionTitleIcon"
            alt="section title icon"
            height="24"
            width="25"
          >
          <div
            class="text-body-1 text-high-emphasis font-weight-medium"
            style="letter-spacing: 0.15px !important;"
          >
            PREGUNTAS FRECUENTES
          </div>
        </div>

        <div class="mb-2 text-center">
          <span class="text-h5 d-inline-block">Resolvemos tus</span> <span
            class="text-h4 d-inline-block font-weight-bold"
            style="line-height: 2rem;"
          >
            dudas
          </span>
        </div>

        <p
          class="text-body-1 font-weight-medium text-center mb-0"
          style="letter-spacing: 0.15px !important;"
        >
          Encuentra respuestas a las preguntas más comunes sobre VERTEX ERP.
        </p>
      </div>

      <div
        class="d-flex align-center justify-space-between flex-wrap flex-md-nowrap"
        style="gap: 6.25rem"
      >
        <VImg
          :src="sittingGirlWithLaptop"
          height="340"
          width="320"
        />

        <div>
          <VExpansionPanels class="py-4">
            <VExpansionPanel
              v-for="faq in faqData"
              :key="faq.question"
            >
              <VExpansionPanelTitle>
                {{ faq.question }}
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                {{ faq.answer }}
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </div>
      </div>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.faq-section {
  margin-block: 5.25rem 4.25rem;
}
</style>
