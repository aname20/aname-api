import { PrismaClient } from '@prisma/client';

const elderlyMedications = [
  // DOENÇA DE PARKINSON
  {
    name: 'Levodopa + Carbidopa (Prolopa)',
    description:
      'Tratamento padrão-ouro para Parkinson. Repõe dopamina no cérebro.',
  },
  {
    name: 'Levodopa + Benserazida (Madopar)',
    description: 'Tratamento para Parkinson com inibidor de decarboxilase.',
  },
  {
    name: 'Pramipexol (Mirapex)',
    description: 'Agonista dopaminérgico para Parkinson inicial ou avançado.',
  },
  {
    name: 'Ropinirol',
    description: 'Agonista dopaminérgico não ergolínico.',
  },
  {
    name: 'Selegilina',
    description: 'Inibidor da MAO-B, retarda progressão do Parkinson.',
  },
  {
    name: 'Rasagilina (Azilect)',
    description: 'Inibidor da MAO-B de segunda geração.',
  },
  {
    name: 'Amantadina',
    description: 'Antiparkinsoniano para discinesias e sintomas motores.',
  },
  {
    name: 'Entacapona (Comtan)',
    description: 'Inibidor da COMT, prolonga efeito da levodopa.',
  },
  {
    name: 'Biperideno (Akineton)',
    description: 'Anticolinérgico para tremores do Parkinson.',
  },
  {
    name: 'Triexifenidil',
    description: 'Anticolinérgico para tremor e rigidez.',
  },

  // ALZHEIMER E DEMÊNCIAS
  {
    name: 'Donepezila (Eranz)',
    description:
      'Inibidor da acetilcolinesterase para Alzheimer leve a moderado.',
  },
  {
    name: 'Rivastigmina (Exelon)',
    description: 'Para Alzheimer e demência de Parkinson.',
  },
  {
    name: 'Galantamina (Reminyl)',
    description: 'Inibidor da acetilcolinesterase para Alzheimer.',
  },
  {
    name: 'Memantina (Ebix)',
    description: 'Antagonista NMDA para Alzheimer moderado a grave.',
  },
  {
    name: 'Ginkgo Biloba',
    description: 'Fitoterápico para melhora cognitiva leve.',
  },

  // DIABETES TIPO 2
  {
    name: 'Metformina',
    description:
      'Primeira linha para diabetes tipo 2, reduz resistência insulínica.',
  },
  {
    name: 'Glibenclamida',
    description: 'Sulfonilureia para estimular produção de insulina.',
  },
  {
    name: 'Gliclazida (Diamicron)',
    description: 'Sulfonilureia de liberação modificada.',
  },
  {
    name: 'Glimepirida (Amaryl)',
    description: 'Sulfonilureia de dose única diária.',
  },
  {
    name: 'Pioglitazona (Actos)',
    description: 'Tiazolidinediona, melhora sensibilidade à insulina.',
  },
  {
    name: 'Insulina NPH',
    description: 'Insulina de ação intermediária, 2x ao dia.',
  },
  {
    name: 'Insulina Regular',
    description: 'Insulina de ação rápida antes das refeições.',
  },
  {
    name: 'Insulina Glargina (Lantus)',
    description: 'Insulina de ação prolongada (24h), dose única.',
  },
  {
    name: 'Insulina Detemir (Levemir)',
    description: 'Insulina de longa ação.',
  },
  {
    name: 'Insulina Lispro (Humalog)',
    description: 'Insulina ultrarrápida.',
  },
  {
    name: 'Insulina Aspart (NovoRapid)',
    description: 'Insulina de ação rápida.',
  },
  {
    name: 'Sitagliptina (Januvia)',
    description: 'Inibidor DPP-4 para diabetes tipo 2.',
  },
  {
    name: 'Vildagliptina (Galvus)',
    description: 'Inibidor DPP-4.',
  },
  {
    name: 'Saxagliptina (Onglyza)',
    description: 'Inibidor DPP-4.',
  },
  {
    name: 'Empagliflozina (Jardiance)',
    description: 'Inibidor SGLT2, proteção cardiovascular.',
  },
  {
    name: 'Dapagliflozina (Forxiga)',
    description: 'Inibidor SGLT2.',
  },
  {
    name: 'Liraglutida (Victoza)',
    description: 'Agonista GLP-1 injetável, perda de peso.',
  },
  {
    name: 'Dulaglutida (Trulicity)',
    description: 'Agonista GLP-1 semanal.',
  },

  // HIPERTENSÃO
  {
    name: 'Losartana Potássica',
    description: 'BRA mais prescrito no Brasil.',
  },
  {
    name: 'Valsartana (Diovan)',
    description: 'BRA para hipertensão.',
  },
  {
    name: 'Telmisartana (Micardis)',
    description: 'BRA de longa duração.',
  },
  {
    name: 'Olmesartana (Benicar)',
    description: 'BRA potente.',
  },
  {
    name: 'Enalapril',
    description: 'IECA para hipertensão e IC.',
  },
  {
    name: 'Captopril',
    description: 'IECA de ação curta.',
  },
  {
    name: 'Ramipril (Triatec)',
    description: 'IECA de longa ação.',
  },
  {
    name: 'Lisinopril',
    description: 'IECA.',
  },
  {
    name: 'Perindopril (Coversyl)',
    description: 'IECA.',
  },
  {
    name: 'Anlodipino (Norvasc)',
    description: 'Bloqueador de canal de cálcio mais usado.',
  },
  {
    name: 'Nifedipino',
    description: 'Bloqueador de canal de cálcio.',
  },
  {
    name: 'Diltiazem',
    description: 'Bloqueador de canal de cálcio para arritmias.',
  },
  {
    name: 'Verapamil',
    description: 'Bloqueador de canal de cálcio.',
  },
  {
    name: 'Atenolol',
    description: 'Betabloqueador.',
  },
  {
    name: 'Propranolol',
    description: 'Betabloqueador não seletivo.',
  },
  {
    name: 'Carvedilol',
    description: 'Betabloqueador para IC e hipertensão.',
  },
  {
    name: 'Metoprolol (Seloken)',
    description: 'Betabloqueador cardiosseletivo.',
  },
  {
    name: 'Bisoprolol',
    description: 'Betabloqueador para IC.',
  },
  {
    name: 'Nebivolol (Nebilet)',
    description: 'Betabloqueador vasodilatador.',
  },
  {
    name: 'Hidroclorotiazida',
    description: 'Diurético tiazídico.',
  },
  {
    name: 'Clortalidona',
    description: 'Diurético tiazídico de longa ação.',
  },
  {
    name: 'Furosemida (Lasix)',
    description: 'Diurético de alça para edema e IC.',
  },
  {
    name: 'Espironolactona',
    description: 'Diurético poupador de potássio.',
  },
  {
    name: 'Indapamida',
    description: 'Diurético tiazídico.',
  },

  // ANTICOAGULANTES E ANTIPLAQUETÁRIOS
  {
    name: 'AAS (Ácido Acetilsalicílico)',
    description: 'Antiagregante plaquetário 100mg.',
  },
  {
    name: 'Clopidogrel (Plavix)',
    description: 'Antiagregante plaquetário.',
  },
  {
    name: 'Ticagrelor (Brilinta)',
    description: 'Antiagregante plaquetário reversível.',
  },
  {
    name: 'Prasugrel (Effient)',
    description: 'Antiagregante plaquetário potente.',
  },
  {
    name: 'Varfarina',
    description: 'Anticoagulante oral clássico.',
  },
  {
    name: 'Rivaroxabana (Xarelto)',
    description: 'Anticoagulante oral direto (inibidor Xa).',
  },
  {
    name: 'Apixabana (Eliquis)',
    description: 'Anticoagulante oral direto.',
  },
  {
    name: 'Dabigatrana (Pradaxa)',
    description: 'Anticoagulante oral direto (inibidor trombina).',
  },
  {
    name: 'Edoxabana (Lixiana)',
    description: 'Anticoagulante oral direto.',
  },
  {
    name: 'Enoxaparina (Clexane)',
    description: 'Heparina de baixo peso molecular injetável.',
  },

  // COLESTEROL E TRIGLICERÍDEOS
  {
    name: 'Sinvastatina',
    description: 'Estatina mais prescrita no Brasil.',
  },
  {
    name: 'Atorvastatina (Lipitor)',
    description: 'Estatina de alta potência.',
  },
  {
    name: 'Rosuvastatina (Crestor)',
    description: 'Estatina de alta potência.',
  },
  {
    name: 'Pravastatina',
    description: 'Estatina hidrofílica.',
  },
  {
    name: 'Ezetimiba (Zetia)',
    description: 'Inibidor da absorção de colesterol.',
  },
  {
    name: 'Fenofibrato',
    description: 'Fibrato para triglicerídeos.',
  },
  {
    name: 'Bezafibrato',
    description: 'Fibrato.',
  },
  {
    name: 'Ômega 3',
    description: 'Suplemento para triglicerídeos.',
  },

  // OSTEOPOROSE
  {
    name: 'Alendronato de Sódio',
    description: 'Bifosfonato semanal para osteoporose.',
  },
  {
    name: 'Risedronato',
    description: 'Bifosfonato.',
  },
  {
    name: 'Ibandronato',
    description: 'Bifosfonato mensal.',
  },
  {
    name: 'Ácido Zoledrônico',
    description: 'Bifosfonato anual injetável.',
  },
  {
    name: 'Denosumabe (Prolia)',
    description: 'Anticorpo monoclonal semestral.',
  },
  {
    name: 'Raloxifeno',
    description: 'Modulador seletivo do receptor de estrogênio.',
  },
  {
    name: 'Carbonato de Cálcio + Vitamina D',
    description: 'Suplementação óssea.',
  },
  {
    name: 'Vitamina D (Colecalciferol)',
    description: 'Essencial para absorção de cálcio.',
  },
  {
    name: 'Calcitriol',
    description: 'Forma ativa da vitamina D.',
  },

  // PROBLEMAS GÁSTRICOS
  {
    name: 'Omeprazol',
    description: 'IBP mais usado no Brasil.',
  },
  {
    name: 'Pantoprazol',
    description: 'IBP.',
  },
  {
    name: 'Esomeprazol (Nexium)',
    description: 'IBP de alta potência.',
  },
  {
    name: 'Lansoprazol',
    description: 'IBP.',
  },
  {
    name: 'Rabeprazol',
    description: 'IBP.',
  },
  {
    name: 'Ranitidina',
    description: 'Antagonista H2.',
  },
  {
    name: 'Famotidina',
    description: 'Antagonista H2.',
  },
  {
    name: 'Sucralfato',
    description: 'Protetor da mucosa gástrica.',
  },

  // INSÔNIA E ANSIEDADE
  {
    name: 'Clonazepam',
    description: 'Benzodiazepínico.',
  },
  {
    name: 'Alprazolam',
    description: 'Benzodiazepínico de curta ação.',
  },
  {
    name: 'Lorazepam',
    description: 'Benzodiazepínico.',
  },
  {
    name: 'Diazepam',
    description: 'Benzodiazepínico clássico.',
  },
  {
    name: 'Bromazepam',
    description: 'Benzodiazepínico ansiolítico.',
  },
  {
    name: 'Zolpidem (Stilnox)',
    description: 'Indutor do sono não benzodiazepínico.',
  },
  {
    name: 'Zopiclona',
    description: 'Indutor do sono.',
  },
  {
    name: 'Trazodona',
    description: 'Antidepressivo sedativo.',
  },
  {
    name: 'Mirtazapina',
    description: 'Antidepressivo sedativo.',
  },
  {
    name: 'Melatonina',
    description: 'Hormônio regulador do sono.',
  },

  // DEPRESSÃO
  {
    name: 'Sertralina (Zoloft)',
    description: 'ISRS, primeira escolha.',
  },
  {
    name: 'Escitalopram (Lexapro)',
    description: 'ISRS bem tolerado.',
  },
  {
    name: 'Fluoxetina (Prozac)',
    description: 'ISRS.',
  },
  {
    name: 'Paroxetina',
    description: 'ISRS.',
  },
  {
    name: 'Citalopram',
    description: 'ISRS.',
  },
  {
    name: 'Venlafaxina (Efexor)',
    description: 'IRSN para depressão e ansiedade.',
  },
  {
    name: 'Duloxetina (Cymbalta)',
    description: 'IRSN, também para dor neuropática.',
  },
  {
    name: 'Bupropiona (Wellbutrin)',
    description: 'Antidepressivo dopaminérgico.',
  },
  {
    name: 'Amitriptilina',
    description: 'Antidepressivo tricíclico, também para dor.',
  },
  {
    name: 'Nortriptilina',
    description: 'Antidepressivo tricíclico.',
  },

  // TIREOIDE
  {
    name: 'Levotiroxina Sódica (Puran T4)',
    description: 'Reposição hormonal para hipotireoidismo.',
  },
  {
    name: 'Liotironina (T3)',
    description: 'Hormônio tireoidiano T3.',
  },
  {
    name: 'Metimazol (Tapazol)',
    description: 'Para hipertireoidismo.',
  },
  {
    name: 'Propiltiouracil',
    description: 'Para hipertireoidismo.',
  },

  // ANEMIA E VITAMINAS
  {
    name: 'Sulfato Ferroso',
    description: 'Suplemento de ferro.',
  },
  {
    name: 'Ácido Fólico',
    description: 'Vitamina B9.',
  },
  {
    name: 'Vitamina B12 (Cianocobalamina)',
    description: 'Essencial para idosos.',
  },
  {
    name: 'Complexo B',
    description: 'Vitaminas do complexo B.',
  },
  {
    name: 'Vitamina C',
    description: 'Antioxidante.',
  },
  {
    name: 'Vitamina E',
    description: 'Antioxidante.',
  },

  // INCONTINÊNCIA URINÁRIA E PRÓSTATA
  {
    name: 'Oxibutinina',
    description: 'Para bexiga hiperativa.',
  },
  {
    name: 'Tolterodina (Detrusitol)',
    description: 'Para bexiga hiperativa.',
  },
  {
    name: 'Solifenacina (Vesicare)',
    description: 'Para bexiga hiperativa.',
  },
  {
    name: 'Tansulosina (Omnic)',
    description: 'Alfabloqueador para próstata.',
  },
  {
    name: 'Doxazosina',
    description: 'Alfabloqueador.',
  },
  {
    name: 'Finasterida (Proscar)',
    description: 'Para hiperplasia prostática.',
  },
  {
    name: 'Dutasterida (Avodart)',
    description: 'Para hiperplasia prostática.',
  },

  // DOR CRÔNICA E NEUROPÁTICA
  {
    name: 'Gabapentina (Neurontin)',
    description: 'Para dor neuropática.',
  },
  {
    name: 'Pregabalina (Lyrica)',
    description: 'Para dor neuropática e fibromialgia.',
  },
  {
    name: 'Tramadol',
    description: 'Opioide fraco para dor moderada.',
  },
  {
    name: 'Codeína',
    description: 'Opioide para dor e tosse.',
  },
  {
    name: 'Morfina',
    description: 'Opioide forte para dor severa.',
  },
  {
    name: 'Oxicodona',
    description: 'Opioide forte.',
  },
  {
    name: 'Paracetamol',
    description: 'Analgésico simples.',
  },
  {
    name: 'Dipirona',
    description: 'Analgésico comum no Brasil.',
  },

  // ANTICOLINÉRGICOS E OUTROS
  {
    name: 'Diciclomina',
    description: 'Antiespasmódico.',
  },
  {
    name: 'Escopolamina (Buscopan)',
    description: 'Antiespasmódico.',
  },
  {
    name: 'Domperidona (Motilium)',
    description: 'Antiemético e procinético.',
  },
  {
    name: 'Metoclopramida (Plasil)',
    description: 'Antiemético.',
  },
  {
    name: 'Ondansetrona',
    description: 'Antiemético potente.',
  },

  // GOTA E ÁCIDO ÚRICO
  {
    name: 'Alopurinol',
    description: 'Reduz ácido úrico.',
  },
  {
    name: 'Febuxostate',
    description: 'Reduz ácido úrico.',
  },
  {
    name: 'Colchicina',
    description: 'Para crises agudas de gota.',
  },

  // RESPIRATÓRIOS
  {
    name: 'Salbutamol',
    description: 'Broncodilatador.',
  },
  {
    name: 'Formoterol',
    description: 'Broncodilatador de longa ação.',
  },
  {
    name: 'Tiotrópio (Spiriva)',
    description: 'Para DPOC.',
  },
  {
    name: 'Budesonida',
    description: 'Corticoide inalatório.',
  },
  {
    name: 'Fluticasona',
    description: 'Corticoide inalatório.',
  },
  {
    name: 'Montelucaste (Singulair)',
    description: 'Antileucotrieno para asma.',
  },
];

export async function medicationSeed(prisma: PrismaClient) {
  console.log('🌱 Iniciando seed de medicamentos...');

  for (const medication of elderlyMedications) {
    const existing = await prisma.medication.findFirst({
      where: { name: medication.name },
    });

    if (!existing) {
      await prisma.medication.create({
        data: medication,
      });
    }
  }

  console.log(
    `✅ ${elderlyMedications.length} medicamentos cadastrados com sucesso!`,
  );
  console.log(
    '📋 Categorias: Parkinson, Alzheimer, Diabetes, Hipertensão, Osteoporose e mais.',
  );
}
