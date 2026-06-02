<?php

namespace App\Http\Requests;

use App\Enums\TransacaoStatus;
use App\Enums\TransacaoTipo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateTransacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if (is_numeric($this->conta_id)) {
            $merge['conta_id'] = (int) $this->conta_id;
        }

        if (is_numeric($this->categoria_id)) {
            $merge['categoria_id'] = (int) $this->categoria_id;
        }

        if (is_numeric($this->tipo)) {
            $merge['tipo'] = (int) $this->tipo;
        }

        if (is_numeric($this->status)) {
            $merge['status'] = (int) $this->status;
        }

        if (is_numeric($this->valor_transacao)) {
            $merge['valor_transacao'] = (float) $this->valor_transacao;
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
            'conta_id' => ['required', 'integer', Rule::exists('contas', 'id')->where('user_id', $this->user()->id)],
            'categoria_id' => ['required', 'integer', Rule::exists('categorias', 'id')->where('user_id', $this->user()->id)],
            'tipo' => ['required', new Enum(TransacaoTipo::class)],
            'descricao' => ['required', 'string', 'max:255'],
            'data_transacao' => ['required', 'date'],
            'valor_transacao' => ['required', 'numeric', 'min:0.01'],
            'status' => ['required', new Enum(TransacaoStatus::class)],
        ];
    }
}
