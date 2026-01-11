import React, {FunctionComponent,useEffect,useState} from 'react';
import PokemonList from './pages/pokemon-list';
import {BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';
import PokemonsDetail from './pages/pokemon-detail';
import PageNotFound from './pages/pages-not-found';  
import PokemonEdit from './pages/pokemon-edit';
import PokemonAdd from './pages/pokemon-add';

const App: FunctionComponent = () => {
 return (
  <Router>
    <div>
        { /* la barre de navigation sera ici */ }
        <nav>
            <div className="nav-wrapper teal">
                <Link to="/" className="brand-logo center">Jeux Vidéo</Link>
            </div>
        </nav>
        {/* Le système de gestion des routes de notre application*/}
        <Switch>
            <Route exact path="/" component={PokemonList} />
            <Route exact path="/pokemons" component={PokemonList} />
            <Route exact path="/pokemons/add" component={PokemonAdd} />
            <Route exact path="/pokemons/edit/:id" component={PokemonEdit} />
            <Route exact path="/pokemons/:id" component={PokemonsDetail} />
            <Route component={PageNotFound} />
        </Switch>
    </div>
  </Router>
 )
}
  
export default App;