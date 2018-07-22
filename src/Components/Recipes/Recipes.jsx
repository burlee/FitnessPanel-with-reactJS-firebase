import axios from 'axios';
import React, { Component } from 'react';
import { DebounceInput } from 'react-debounce-input';
import uuid from 'uuid';

import Aux from '../../HOC/aux_x';
import Backdrop from '../../UI/Backdrop/Backdrop';
import Header from '../../UI/Header/Header';
import PanelWrapper from '../../UI/PanelWrapper/PanelWrapper';
import Paragraph from '../../UI/Paragraph/Paragraph';
import DisplayRecipe from './DisplayRecipe/DisplayRecipe';
import RecipeDetails from './RecipeDetails/RecipeDetails';
import classes from './Recipes.css';

export default class Recipes extends Component {
    state = {
        modalIsOpen: false,
        showRecipeDetails: false,
        showSearchBar: false,
        selectedValue: 'Łatwy',
        search: '',
        recipeName: '',
        recipeDescribe: '',
        url: '',
        time: '',
        calories: '',
        level: '',
        recipes: []
    }

    componentDidMount(){
        const updateRecipes = [];
        axios.get(`https://fitnesspanel-eb7a2.firebaseio.com/recipes.json`)
            .then(response => {
                let mealFromDB = response.data;
                for (let key in mealFromDB) {
                    updateRecipes.push({
                        uid: mealFromDB[key].uid,
                        name: mealFromDB[key].name,
                        url: mealFromDB[key].url,
                        calories: mealFromDB[key].calories,
                        time: mealFromDB[key].time,
                        recipeDescribe: mealFromDB[key].recipeDescribe,
                        level: mealFromDB[key].level
                    })
                    this.setState({ recipes: updateRecipes})
                }
            })
            .catch(error => console.log(error))
    }

    modalToggle = () => {
        this.setState({modalIsOpen: !this.state.modalIsOpen})
    }

    selectedValueHandler = (event) => {
        this.setState({selectedValue: event.target.value})
    }
    recipeDetailsHandler = (event) =>{
        event.preventDefault();
        const recipeName = event.target.elements.name.value;
        const time = event.target.elements.time.value;
        const calories = event.target.elements.calories.value;
        const recipeDescribe = event.target.elements.recipeDescribe.value;
        const url = event.target.elements.photo.value;
        const level = this.state.selectedValue;

        const newRecipe = {
            uid: uuid(),
            url: url,
            name: recipeName,
            time: time,
            calories: calories,
            recipeDescribe: recipeDescribe,
            level: level
        }

        axios.post(`https://fitnesspanel-eb7a2.firebaseio.com/recipes.json`, newRecipe)
            .then(response => {
                if(response.status === 200){
                    let recipes = [...this.state.recipes];
                    recipes.push(newRecipe);
                    this.setState({recipes:recipes, modalIsOpen: false})
                }
            })
            .catch(error => console.log(error))
    }

    showRecipeDetails = (recipeDescribe,recipeName, recipeUrl, calories, time, level) => {
        this.setState({
            recipeName: recipeName,
            recipeDescribe: recipeDescribe,
            url: recipeUrl,
            calories: calories,
            time: time,
            level: level,
            showRecipeDetails: true
        })
    }

    toggle = () => {
        this.setState({showRecipeDetails: !this.state.showRecipeDetails})
    }

    toggleSearchBar = () => {
        this.setState({showSearchBar: !this.state.showSearchBar})
    }

    render() {
        let displayRecipes = null;

        if (this.state.recipes.length !== 0) {
            displayRecipes = this.state.recipes
            .filter(recipe => {
                return recipe.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1;
            })
            .map( recipe => {
                return <DisplayRecipe
                key={recipe.uid}
                calories={recipe.calories}
                time={recipe.time}
                name={recipe.name}
                url={recipe.url}
                level={recipe.level}
                recipeDescribe={recipe.recipeDescribe}
                showRecipeDetails={() => this.showRecipeDetails(recipe.recipeDescribe, recipe.name, recipe.url, recipe.calories, recipe.time, recipe.level)}
                />
            })
        } 

        return (
            <PanelWrapper wrapperType="DisplayFlex">
                <Header>
                    {this.state.showSearchBar ? null :
                    <Aux>
                        <div className={classes.Loup}>
                            <i onClick={this.toggleSearchBar} className="fas fa-search"></i>
                        </div>
                        <Paragraph>
                            Korzystaj z bazy przepisow na zdrowe dania i dziel się z innymi użytkownikami swoimi fit pomysłami na jedzenie .
                            W naszej bazie znajduje się {this.state.recipes.length} przepisow.
                        </Paragraph>
                    </Aux>
                    }
                    {this.state.showSearchBar ? 
                        <div className={classes.searchBar}>
                            <DebounceInput
                                className={classes.searchBarInput}
                                minLength={1}
                                debounceTimeout={300}
                                placeholder="Wpisz nazwę przepisu, którego szukasz..."
                                onChange={(event)=>this.setState({search: event.target.value})}
                            />
                            <i onClick={this.toggleSearchBar} class="fas fa-times"></i>
                        </div>
                    : null}
                </Header>
                {this.state.showRecipeDetails ? <RecipeDetails 
                    toggle={this.toggle} 
                    show={this.state.showRecipeDetails} 
                    recipeName={this.state.recipeName}
                    url={this.state.url}
                    recipeDescribe={this.state.recipeDescribe}
                    time={this.state.time}
                    calories={this.state.calories}
                    level={this.state.level}
                    /> : null}
                {displayRecipes}
                {this.state.modalIsOpen ? 
                <Aux>
                    <div className={classes.Modal} >
                        <form onSubmit={this.recipeDetailsHandler}>
                            <label htmlFor="name" style={{ marginTop: '12px' }}>Nazwa dania:</label>
                            <input type="text" name="name" id="name" placeholder="Podaj nazwę przepisu..." required autoComplete="off" />
                            <label htmlFor="time">Czas przygotowania(min):</label>
                            <input type="number" name="time" id="time" placeholder="Podaj czas przygotowania..." required autoComplete="off" />
                            <label htmlFor="calories">Kaloryczność(kcal):</label>
                            <input type="number" name="calories" id="calories" placeholder="Podaj kaloryczność..." required autoComplete="off" />
                            <label htmlFor="photo">Zdjęcie(URL):</label>
                            <input type="text" name="photo" id="photo" placeholder="Podaj adres url..." required autoComplete="off" />
                            <label htmlFor="level">Wybierz poziom trudności:</label>
                            <select id="level" onChange={this.selectedValueHandler} required>
                                <option value="Łatwy">Łatwy</option>
                                <option value="Średni">Średni</option>
                                <option value="Trudny">Trudny</option>
                            </select>
                            <label htmlFor="recipeDescribe">Opis przepisu:</label>
                            <textarea name="recipeDescribe" id="recipeDescribe" placeholder="Wymień składniki oraz kroki jak przygotować" required></textarea>
                            <button>Dodaj przepis</button>
                        </form>
                    </div>
                    <Backdrop show={this.state.modalIsOpen} modalClosed={this.modalToggle}/>
                </Aux> : null}
                <button onClick={this.modalToggle} className={classes.AddRecipeBtn}>Dodaj przepis</button>
            </PanelWrapper>
        )
    }
}
