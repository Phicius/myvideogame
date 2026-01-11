import React, { FunctionComponent, useState } from 'react';
import { useHistory } from 'react-router-dom';  
import Pokemon from '../models/pokemon';
import formatType from '../helpers/format-type';
import PokemonService from '../services/pokemon-service';
  
type Props = {
  pokemon: Pokemon,
  isEditForm?: boolean
};

type Field = {
  value?: any,
  error?: string,
  isValid?: boolean
}

type Form = {
  picture: Field,
  name: Field,
  hp: Field,
  cp: Field,
  types: Field
}
  
const PokemonForm: FunctionComponent<Props> = ({pokemon,isEditForm}) => {
  
  const [form, setForm] = useState<Form>({
    picture: { value: pokemon.picture, isValid: true },
    name: { value: pokemon.name, isValid: true },
    hp: { value: pokemon.hp, isValid: true },
    cp: { value: pokemon.cp, isValid: true },
    types: { value: pokemon.types, isValid: true }
  });

  const history = useHistory();

  const types: string[] = [
    'Plante', 'Feu', 'Eau', 'Insecte', 'Normal', 'Electrik',
    'Poison', 'Fée', 'Vol', 'Combat', 'Psy'
  ];

  const hasType = (type: string): boolean => {
    return form.types.value.includes(type);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName: string = e.target.name;
    const fieldValue: string = e.target.value;
    // Conserver la structure `Field` pour chaque propriété du formulaire
    const newField: Field = { value: fieldValue };
    setForm(prevForm => ({
      ...prevForm,
      // Mettre à jour la propriété correspondante en conservant les autres champs
      [fieldName]: { ...((prevForm as any)[fieldName] || {}), ...newField }
    } as Form));
  }

  const selectType = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const checked: boolean = e.target.checked;
    let newField: Field;

    if (checked) {
      // Si l'utilisateur coche le type, on la liste des types du pokémon
      const newTypes: string[] = form.types.value.concat([type]);
      newField = { value: newTypes };
    } else {
      // Si l'utilisateur décoche le type, on le retire de la liste des types du pokémon
      const newTypes: string[] = form.types.value.filter((currentType: string) => currentType !== type);
      newField = { value: newTypes };
    } 
    setForm({...form, ...{types: newField}});
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isFormValid = validateForm();
    if (isFormValid) {
      pokemon.picture = form.picture.value;
      pokemon.name = form.name.value;
      pokemon.hp = form.hp.value;
      pokemon.cp = form.cp.value;
      pokemon.types = form.types.value;

      isEditForm ? updatePokemon() : addPokemon();
      
    }
  }

  const addPokemon = () => {
    PokemonService.addPokemon(pokemon).then(() =>history.push('/pokemons/'));
  }

  const updatePokemon = () => {
    PokemonService.updatePokemon(pokemon).then(() =>history.push(`/pokemons/${pokemon.id}`));
  }

  const isAddForm = (): boolean => {
    return !isEditForm ;
  }

  const validateForm = ()=> {
    let newForm: Form = form;
    
    // Validation de l'url de l'image
    if (isAddForm()){
      const start = "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/";
      const end = ".png";
      if (!form.picture.value.startsWith(start) || !form.picture.value.endsWith(end)) {
        const errorMsg: string = `L'url de l'image doit commencer par ${start} et se terminer par ${end}.`;
        const newField: Field = { value: form.picture.value, error: errorMsg, isValid: false };
        newForm = { ...newForm, ...{ picture: newField } };
      } else {
        const newField: Field = { value: form.picture.value, error: '', isValid: true };
        newForm = { ...newForm, ...{ picture: newField } };
      }
    }

    // Validation du name
    if (!/^[a-zA-Zàéè ]{3,25}$/.test(form.name.value)) {
      const errorMsg: string = 'Le nom du pokémon doit contenir entre 3 et 25 caractères.';
      const newField: Field = { value: form.name.value, error: errorMsg, isValid: false };
      newForm = { ...newForm, ...{ name: newField } };
    } else {
      const newField: Field = { value: form.name.value, error: '', isValid: true };
      newForm = { ...newForm, ...{ name: newField } };
    }

    // Validator Hp
    if (!/^[0-9]{1,3}$/.test(form.hp.value)) {
      const errorMsg: string = 'Les points de vie du pokémon doivent être un nombre entre 0 et 999.';
      const newField: Field = { value: form.hp.value, error: errorMsg, isValid: false };
      newForm = { ...newForm, ...{ hp: newField } };
    }
    else {
      const newField: Field = { value: form.hp.value, error: '', isValid: true };
      newForm = { ...newForm, ...{ hp: newField } };
    }

    // Validator Cp
    if (!/^[0-9]{1,2}$/.test(form.cp.value)) {
      const errorMsg: string = 'Les dégâts du pokémon doivent être un nombre entre 0 et 99.';
      const newField: Field = { value: form.cp.value, error: errorMsg, isValid: false };
      newForm = { ...newForm, ...{ cp: newField } };
    }
    else {
      const newField: Field = { value: form.cp.value, error: '', isValid: true };
      newForm = { ...newForm, ...{ cp: newField } };
    }
    setForm(newForm);
    return newForm.name.isValid && newForm.hp.isValid && newForm.cp.isValid;
  }

  const isTypesValid = (type: string): boolean => {
    if (form.types.value.length === 1 && hasType(type)) {
      return false;
    }
    if (form.types.value.length >= 3 && !hasType(type)) {
      return false;
    }
    return true;
  }

  const deletePokemon = () => {
    PokemonService.deletePokemon(pokemon).then(() => history.push('/pokemons'));
  }
   
  return (
    <form onSubmit={e => handleSubmit(e)}>
      <div className="row">
        <div className="col s12 m8 offset-m2">
          <div className="card hoverable"> 
            {isEditForm &&(
            <div className="card-image">
              <img src={pokemon.picture} alt={pokemon.name} style={{width: '250px', margin: '0 auto'}}/>
              <span className="btn-floating halfway-fab waves-effect waves-light red" onClick={deletePokemon} style={{cursor: 'pointer'}}>
                <i className="material-icons">delete</i>
              </span>
            </div>
            )}
            <div className="card-stacked">
              <div className="card-content">
                {/* Pokemon picture */}
                {isAddForm() && (
                <div className="form-group">
                  <label htmlFor="name">Image</label>
                  <input id="picture" name="picture" type="text" className="form-control" value={form.picture.value} onChange={e=> handleInputChange(e)}></input>
                  { form.picture.error  && 
                  (<div className="card-panel red lighten-2">
                    {form.picture.error}
                  </div>) 
                  }
                </div>
                )}
                {/* Pokemon name */}
                <div className="form-group">
                  <label htmlFor="name">Nom</label>
                  <input id="name" name="name" type="text" className="form-control" value={form.name.value} onChange={e=> handleInputChange(e)}></input>
                  { form.name.error  && 
                  (<div className="card-panel red lighten-2">
                    {form.name.error}
                  </div>) 
                  }
                </div>
                {/* Pokemon hp */}
                <div className="form-group">
                  <label htmlFor="hp">Point de vie</label>
                  <input id="hp" type="number" name="hp" className="form-control" value={form.hp.value} onChange={e=> handleInputChange(e)}></input>
                </div>
                { form.hp.error  && 
                  (<div className="card-panel red lighten-2">
                    {form.hp.error}
                  </div>) 
                  }
                {/* Pokemon cp */}
                <div className="form-group">
                  <label htmlFor="cp">Dégâts</label>
                  <input id="cp" type="number" name="cp" className="form-control" value={form.cp.value} onChange={e=> handleInputChange(e)}></input>
                </div>
                { form.cp.error  && 
                  (<div className="card-panel red lighten-2">
                    {form.cp.error}
                  </div>) 
                  }
                {/* Pokemon types */}
                <div className="form-group">
                  <label>Types</label>
                  {types.map(type => (
                    <div key={type} style={{marginBottom: '10px'}}>
                      <label>
                        <input id={type} type="checkbox" checked={hasType(type)} disabled={!isTypesValid(type)} onChange={e => selectType(type,e)} className="filled-in"></input>
                        <span>
                          <p className={formatType(type)}>{ type }</p>
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-action center">
                {/* Submit button */}
                <button type="submit" className="btn">Valider</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
   
export default PokemonForm;