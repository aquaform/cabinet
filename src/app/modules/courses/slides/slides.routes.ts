import { SlideComponent } from "./slide/slide.component";

export const slideRoutes = [
    { path: "", component: SlideComponent },
    { path: "slide/:slide", component: SlideComponent },
    { path: "slide/:slide/page/:page", component: SlideComponent },
    { path: "slide/:slide/attempt/:attempt", component: SlideComponent },
    { path: "slide/:slide/attempt/:attempt/page/:page", component: SlideComponent }
];