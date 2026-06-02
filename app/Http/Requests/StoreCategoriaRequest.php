<?php

namespace App\Http\Requests;

use App\Enums\CategoriaTipo;
use App\Models\Categoria;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Validator;

class StoreCategoriaRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $merge = [];

        if (empty($this->categoria_pai_id)) {
            $merge['categoria_pai_id'] = null;
        }

        if (is_numeric($this->tipo)) {
            $merge['tipo'] = (int) $this->tipo;
        }

        if ($merge) {
            $this->merge($merge);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:30'],
            'icone' => is_null($this->categoria_pai_id)
                ? ['required', 'string', 'max:50']
                : ['nullable', 'string', 'max:50'],
            'tipo' => ['required', new Enum(CategoriaTipo::class)],
            'categoria_pai_id' => [
                'nullable',
                'integer',
                Rule::exists('categorias', 'id')->where('user_id', $this->user()->id),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->has('categoria_pai_id')) {
                return;
            }

            $userId = $this->user()->id;
            $categoriaPaiId = $this->categoria_pai_id;

            if (is_null($categoriaPaiId)) {
                $total = Categoria::where('user_id', $userId)
                    ->whereNull('categoria_pai_id')
                    ->where('is_active', true)
                    ->count();

                if ($total >= 25) {
                    $validator->errors()->add('categoria_pai_id', 'Você atingiu o limite de 25 categorias pai.');
                }
            } else {
                $total = Categoria::where('user_id', $userId)
                    ->where('categoria_pai_id', $categoriaPaiId)
                    ->where('is_active', true)
                    ->count();

                if ($total >= 5) {
                    $validator->errors()->add('categoria_pai_id', 'Esta categoria já atingiu o limite de 5 subcategorias.');
                }
            }
        });
    }
}
