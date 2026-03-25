import { useState, useEffect } from "react";
import { CButton, CFormInput, CFormSelect } from "@coreui/react";

const CustomFieldForm = ({ field, onClose, onSuccess }) => {

  const [name,setName] = useState("");
  const [type,setType] = useState("text");
  const [required,setRequired] = useState(false);

  const [options,setOptions] = useState([]);
  const [optionInput,setOptionInput] = useState("");
  useEffect(()=>{
  if(field){
    setName(field.name);
    setType(field.field_type);
    setRequired(field.is_required);
    setOptions(field.options || []);
  }
},[field]);
  const addOption = () => {
    if(!optionInput.trim()) return;
    if(options.includes(optionInput)) return;

    setOptions([...options, optionInput]);
    setOptionInput("");
  };

  const removeOption = (i) => {
    setOptions(options.filter((_,index)=>index!==i));
  };

  const handleSubmit = async () => {

    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/custom-fields",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body:JSON.stringify({
        name,
        field_type:type,
        is_required:required,
        options: type === "select" ? options : null
      })
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="mb-4">

      <CFormInput
        label="Nom du champ"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <CFormSelect
        label="Type"
        value={type}
        onChange={(e)=>setType(e.target.value)}
        className="mt-2"
      >
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="select">Select</option>
      </CFormSelect>

      <CFormSelect
        label="Obligatoire"
        value={required}
        onChange={(e)=>setRequired(e.target.value==="true")}
        className="mt-2"
      >
        <option value="false">Non</option>
        <option value="true">Oui</option>
      </CFormSelect>

      {/* OPTIONS */}
      {type === "select" && (
        <div className="mt-3">

          <div className="d-flex gap-2">
            <input
              className="form-control"
              value={optionInput}
              onChange={(e)=>setOptionInput(e.target.value)}
              placeholder="Ajouter option"
            />

            <button className="btn btn-success" onClick={addOption}>
              +
            </button>
          </div>

          <ul className="mt-2">
            {options.map((opt,i)=>(
              <li key={i} className="d-flex justify-content-between">
                {opt}
                <button className="btn btn-sm btn-danger" onClick={()=>removeOption(i)}>
                  x
                </button>
              </li>
            ))}
          </ul>

        </div>
      )}

      <div className="mt-3 d-flex gap-2">
        <CButton color="primary" onClick={handleSubmit}>
          Enregistrer
        </CButton>

        <CButton color="secondary" onClick={onClose}>
          Annuler
        </CButton>
      </div>

    </div>
  );
};

export default CustomFieldForm;