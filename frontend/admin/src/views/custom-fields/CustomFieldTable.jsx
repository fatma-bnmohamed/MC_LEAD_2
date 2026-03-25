import { CTable } from "@coreui/react";

const CustomFieldTable = ({
  fields,
  selectedFields,
  toggleSelect,
  toggleSelectAll,
  handleEdit,
  deleteOne
}) => {

  return (
    
    <CTable striped>

      <thead>
       
        <tr>
             <th>
                <input
                    type="checkbox"
                    checked={selectedFields.length === fields.length && fields.length > 0}
                    onChange={toggleSelectAll}
                    ref={el => {
                        if (el) {
                        el.indeterminate =
                            selectedFields.length > 0 &&
                            selectedFields.length < fields.length;
    }
  }}
                />
                
                
             </th>
          <th>Nom</th>
          <th>Type</th>
          <th>Obligatoire</th>
          <th>Options</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
  {fields.map(field => (
    <tr key={field.id}>

      
      <td>
        <input
          type="checkbox"
          checked={selectedFields.includes(field.id)}
          onChange={() => toggleSelect(field.id)}
        />
      </td>

      <td>{field.name}</td>
      <td>{field.field_type}</td>
      <td>{field.is_required ? "Oui" : "Non"}</td>
      <td>{field.options ? field.options.join(", ") : "-"}</td>

      
      <td>

  <button
    className="btn btn-sm" style={{ width: "40px", height: "34px", color:"white" }}
    onClick={()=>handleEdit(field)}
  >
    ✏️
  </button>

  <button
    className="btn btn-sm " style={{ width: "40px", height: "34px", color:"white" }}
    onClick={()=>deleteOne(field.id)}
  >
    🗑
  </button>

</td>

    </tr>
  ))}
</tbody>

    </CTable>
  );
};

export default CustomFieldTable;