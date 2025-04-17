
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

ChartJS.register(BarElement, CategoryScale, LinearScale);

const templates = [
  { id: 1, subject: "Historia", title: "Las Revoluciones Atlánticas" },
  { id: 2, subject: "Matemáticas", title: "Fracciones y proporciones" },
  { id: 3, subject: "Lenguaje", title: "Comprensión de textos narrativos" },
  { id: 4, subject: "Ciencias Naturales", title: "El ciclo del agua" }
];

const generarContenidoIA = (subject) => {
  if (subject === "Lenguaje") {
    return {
      objetivos: "Desarrollar comprensión lectora en textos narrativos.",
      actividades: "Lectura guiada, análisis de personajes, discusión.",
      evaluacion: "Prueba escrita y actividad de resumen gráfico."
    };
  } else if (subject === "Historia") {
    return {
      objetivos: "Analizar causas y consecuencias de eventos históricos clave.",
      actividades: "Debate, línea de tiempo, comparación de fuentes.",
      evaluacion: "Ensayo reflexivo o presentación visual."
    };
  } else if (subject === "Matemáticas") {
    return {
      objetivos: "Aplicar fracciones y proporciones en situaciones reales.",
      actividades: "Resolución de problemas, ejercicios colaborativos.",
      evaluacion: "Cuestionario práctico y participación en clase."
    };
  } else if (subject === "Ciencias Naturales") {
    return {
      objetivos: "Comprender las etapas del ciclo del agua y su importancia.",
      actividades: "Experimento, visualización interactiva, mapa conceptual.",
      evaluacion: "Informe de experimento y exposición oral."
    };
  }
  return {
    objetivos: "Objetivo generado automáticamente.",
    actividades: "Actividad sugerida automáticamente.",
    evaluacion: "Evaluación sugerida automáticamente."
  };
};

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editContent, setEditContent] = useState({
    objetivos: "",
    actividades: "",
    evaluacion: "",
  });
  const [result, setResult] = useState({
    realizada: 0,
    adaptada: 0,
    no_implementada: 0,
  });
  const [clasesCompartidas, setClasesCompartidas] = useState([]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setEditContent(generarContenidoIA(template.subject));
  };

  const handleChange = (e) => {
    setEditContent({ ...editContent, [e.target.name]: e.target.value });
  };

  const registerResult = (type) => {
    setResult((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    alert("Registro guardado.");
  };

  const guardarClase = async () => {
    try {
      await addDoc(collection(db, "clases"), {
        ...editContent,
        plantilla: selectedTemplate.title,
        timestamp: new Date()
      });
      alert("Clase compartida exitosamente 🎉");
    } catch (e) {
      alert("Error al compartir clase: " + e.message);
    }
  };

  useEffect(() => {
    const obtenerClases = async () => {
      const querySnapshot = await getDocs(collection(db, "clases"));
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push(doc.data());
      });
      setClasesCompartidas(docs);
    };
    obtenerClases();
  }, []);

  const data = {
    labels: ["Realizadas", "Adaptadas", "No implementadas"],
    datasets: [
      {
        label: "Estado de implementación",
        backgroundColor: ["#4ade80", "#facc15", "#f87171"],
        data: [result.realizada, result.adaptada, result.no_implementada],
      },
    ],
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">COLAB ED</h1>
      {!selectedTemplate ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Selecciona una plantilla:</h2>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleTemplateSelect(tpl)}
              className="block w-full text-left p-2 mb-2 border rounded hover:bg-gray-100"
            >
              {tpl.subject}: {tpl.title}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedTemplate(null)} className="mb-4 text-blue-500">Volver</button>
          <h2 className="text-xl font-semibold mb-2">Editando: {selectedTemplate.title}</h2>
          <label className="block mb-2">
            Objetivos:
            <textarea name="objetivos" className="w-full border p-2" value={editContent.objetivos} onChange={handleChange} />
          </label>
          <label className="block mb-2">
            Actividades:
            <textarea name="actividades" className="w-full border p-2" value={editContent.actividades} onChange={handleChange} />
          </label>
          <label className="block mb-4">
            Evaluación:
            <textarea name="evaluacion" className="w-full border p-2" value={editContent.evaluacion} onChange={handleChange} />
          </label>

          <div className="mb-4">
            <h3 className="font-semibold">¿Cómo se implementó?</h3>
            <button onClick={() => registerResult("realizada")} className="bg-green-400 text-white px-4 py-2 m-1 rounded">Clase realizada tal cual</button>
            <button onClick={() => registerResult("adaptada")} className="bg-yellow-400 text-white px-4 py-2 m-1 rounded">Clase adaptada</button>
            <button onClick={() => registerResult("no_implementada")} className="bg-red-400 text-white px-4 py-2 m-1 rounded">No se alcanzó a implementar</button>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Participación del alumnado:</h3>
            <label className="block"><input type="radio" name="participacion" /> Alta</label>
            <label className="block"><input type="radio" name="participacion" /> Media</label>
            <label className="block"><input type="radio" name="participacion" /> Baja</label>
          </div>

          <button onClick={guardarClase} className="bg-blue-500 text-white px-4 py-2 m-1 rounded">
            Compartir esta clase
          </button>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Clases compartidas</h2>
        {clasesCompartidas.map((clase, index) => (
          <div key={index} className="p-2 border rounded mb-2">
            <strong>{clase.plantilla}</strong><br />
            <em>Objetivos:</em> {clase.objetivos}<br />
            <em>Actividades:</em> {clase.actividades}<br />
            <em>Evaluación:</em> {clase.evaluacion}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Resumen de implementación</h2>
        <Bar data={data} />
      </div>
    </div>
  );
}
