import { ViewModelBinder } from "@paperbits/common/widgets";
import { ListOfApisViewModel } from "./listOfApisViewModel";
import { ListOfApisModel } from "../listOfApisModel";
import { Bag } from "@paperbits/common";
import { EventManager, Events } from "@paperbits/common/events";
import { ComponentFlow } from "@paperbits/common/editing";
import { StyleCompiler } from "@paperbits/common/styles";
import { ListOfApisDropdownHandlers, ListOfApisHandlers, ListOfApisTilesHandlers } from "../listOfApisHandlers";


export class ListOfApisViewModelBinder implements ViewModelBinder<ListOfApisModel, ListOfApisViewModel> {

    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: ListOfApisModel, viewModel?: ListOfApisViewModel, bindingContext?: Bag<any>): Promise<ListOfApisViewModel> {
        if (!viewModel) {
            viewModel = new ListOfApisViewModel();
        }

        viewModel.layout(model.layout);

        viewModel.runtimeConfig(JSON.stringify({
            allowSelection: model.allowSelection,
            showApiType: model.showApiType,
            defaultGroupByTagToEnabled: model.defaultGroupByTagToEnabled,
            detailsPageUrl: model.detailsPageHyperlink
                ? model.detailsPageHyperlink.href
                : undefined
        }));

        const handlerForLayout = {
            list: ListOfApisHandlers,
            dropdown: ListOfApisDropdownHandlers
        };
        const handler = handlerForLayout[model.layout] ?? ListOfApisTilesHandlers;

        viewModel["widgetBinding"] = {
            displayName: "List of APIs" + (model.layout === "list" ? "" : ` (${model.layout})`),
            model: model,
            draggable: true,
            handler: handler,
            flow: ComponentFlow.Block,
            editor: "list-of-apis-editor",
            applyChanges: async (updatedModel: ListOfApisModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            }
        };

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, handler));
        }

        return viewModel;
    }

    public canHandleModel(model: ListOfApisModel): boolean {
        return model instanceof ListOfApisModel;
    }
}